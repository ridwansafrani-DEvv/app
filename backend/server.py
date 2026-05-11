from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ritri2025')

app = FastAPI(title="Ritri Auto Solution API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# In-memory token store (simple session for admin)
ACTIVE_TOKENS: dict = {}


# ============ MODELS ============
class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: Literal["mobil", "motor"]
    brand: str
    year: int
    mileage: int  # km
    price: int  # IDR
    transmission: str = "Manual"
    fuel: str = "Bensin"
    color: str = ""
    image_url: str
    gallery: List[str] = Field(default_factory=list)
    location: str = "Balikpapan"
    status: str = "Unit Ready"
    description: str = ""
    features: List[str] = Field(default_factory=list)
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class VehicleCreate(BaseModel):
    title: str
    category: Literal["mobil", "motor"]
    brand: str
    year: int
    mileage: int
    price: int
    transmission: str = "Manual"
    fuel: str = "Bensin"
    color: str = ""
    image_url: str
    gallery: List[str] = Field(default_factory=list)
    location: str = "Balikpapan"
    status: str = "Unit Ready"
    description: str = ""
    features: List[str] = Field(default_factory=list)
    featured: bool = False


class VehicleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[Literal["mobil", "motor"]] = None
    brand: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    price: Optional[int] = None
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    color: Optional[str] = None
    image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    location: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    featured: Optional[bool] = None


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    type: Literal["beli", "jual", "gadai", "kontak"]
    vehicle_id: Optional[str] = None
    vehicle_title: Optional[str] = None
    message: str = ""
    # Gadai-specific
    bpkb_type: Optional[str] = None  # motor / mobil
    estimated_value: Optional[int] = None
    loan_amount: Optional[int] = None
    tenor_months: Optional[int] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadCreate(BaseModel):
    name: str
    phone: str
    type: Literal["beli", "jual", "gadai", "kontak"]
    vehicle_id: Optional[str] = None
    vehicle_title: Optional[str] = None
    message: str = ""
    bpkb_type: Optional[str] = None
    estimated_value: Optional[int] = None
    loan_amount: Optional[int] = None
    tenor_months: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


# ============ AUTH ============
def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing token")
    token = credentials.credentials
    info = ACTIVE_TOKENS.get(token)
    if not info or info["expires"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return info["username"]


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Ritri Auto Solution API", "status": "ok"}


@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(payload: LoginRequest):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = secrets.token_urlsafe(32)
    ACTIVE_TOKENS[token] = {
        "username": payload.username,
        "expires": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return LoginResponse(token=token, username=payload.username)


@api_router.post("/admin/logout")
async def admin_logout(_: str = Depends(get_current_admin), credentials: HTTPAuthorizationCredentials = Depends(security)):
    ACTIVE_TOKENS.pop(credentials.credentials, None)
    return {"ok": True}


@api_router.get("/admin/me")
async def admin_me(username: str = Depends(get_current_admin)):
    return {"username": username}


# --- Vehicles (public) ---
@api_router.get("/vehicles", response_model=List[Vehicle])
async def list_vehicles(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50,
):
    query: dict = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    docs = await db.vehicles.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    doc = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Kendaraan tidak ditemukan")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


# --- Vehicles (admin) ---
@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(payload: VehicleCreate, _: str = Depends(get_current_admin)):
    vehicle = Vehicle(**payload.model_dump())
    doc = vehicle.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.vehicles.insert_one(doc)
    return vehicle


@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, payload: VehicleUpdate, _: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    result = await db.vehicles.update_one({"id": vehicle_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kendaraan tidak ditemukan")
    doc = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, _: str = Depends(get_current_admin)):
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kendaraan tidak ditemukan")
    return {"ok": True}


# --- Leads ---
@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.leads.insert_one(doc)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(_: str = Depends(get_current_admin), limit: int = 200):
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, _: str = Depends(get_current_admin)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead tidak ditemukan")
    return {"ok": True}


# --- Stats (admin) ---
@api_router.get("/admin/stats")
async def admin_stats(_: str = Depends(get_current_admin)):
    total_vehicles = await db.vehicles.count_documents({})
    total_motor = await db.vehicles.count_documents({"category": "motor"})
    total_mobil = await db.vehicles.count_documents({"category": "mobil"})
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    return {
        "vehicles": {"total": total_vehicles, "motor": total_motor, "mobil": total_mobil},
        "leads": {"total": total_leads, "new": new_leads},
    }


# ============ SEED ============
SEED_VEHICLES = [
    {
        "title": "Toyota Avanza Veloz 1.5 AT",
        "category": "mobil",
        "brand": "Toyota",
        "year": 2021,
        "mileage": 45000,
        "price": 195000000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Putih Mutiara",
        "image_url": "https://images.unsplash.com/photo-1659083934189-ebc3cfd8d4c4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1659083934189-ebc3cfd8d4c4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "MPV keluarga favorit. Pajak hidup, surat lengkap, kaki-kaki senyap, interior wangi. Siap pakai luar kota.",
        "features": ["Pajak Hidup", "Service Record", "Kaki-kaki Senyap", "AC Double Blower"],
        "featured": True,
    },
    {
        "title": "Honda Brio Satya E CVT",
        "category": "mobil",
        "brand": "Honda",
        "year": 2022,
        "mileage": 28000,
        "price": 168000000,
        "transmission": "CVT",
        "fuel": "Bensin",
        "color": "Merah",
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "City car irit BBM, cocok harian Balikpapan-Handil. Tangan pertama, bebas tabrak.",
        "features": ["Tangan Pertama", "Bebas Tabrak", "Irit BBM", "Audio Touchscreen"],
        "featured": True,
    },
    {
        "title": "Mitsubishi Xpander Sport AT",
        "category": "mobil",
        "brand": "Mitsubishi",
        "year": 2020,
        "mileage": 62000,
        "price": 215000000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Hitam Metalik",
        "image_url": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Handil",
        "status": "Unit Ready",
        "description": "MPV gagah dan lapang. Mesin halus, suspensi empuk. Cocok untuk keluarga besar.",
        "features": ["Cruise Control", "Push Start", "Captain Seat", "Velg Racing"],
        "featured": False,
    },
    {
        "title": "Daihatsu Sigra R AT",
        "category": "mobil",
        "brand": "Daihatsu",
        "year": 2023,
        "mileage": 18000,
        "price": 162000000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Silver",
        "image_url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "LMPV super irit, baru pakai 1 tahun. Garansi resmi masih aktif.",
        "features": ["Garansi Resmi", "Service Record ATPM", "Irit BBM", "7 Seater"],
        "featured": False,
    },
    {
        "title": "Honda Vario 160 ABS",
        "category": "motor",
        "brand": "Honda",
        "year": 2023,
        "mileage": 8500,
        "price": 28500000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Merah Hitam",
        "image_url": "https://images.unsplash.com/photo-1711900740026-d6caecdaf574?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1711900740026-d6caecdaf574?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "Matic premium 160cc. ABS, Smart Key, body mulus. Pajak panjang.",
        "features": ["ABS", "Smart Key", "Body Mulus", "Pajak Panjang"],
        "featured": True,
    },
    {
        "title": "Yamaha NMAX 155 Connected",
        "category": "motor",
        "brand": "Yamaha",
        "year": 2022,
        "mileage": 15200,
        "price": 26500000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Hitam Doff",
        "image_url": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "Big matic nyaman untuk turing dan harian. Service rutin Yamaha.",
        "features": ["Connected", "ABS", "Service Yamaha", "Ban Tebal"],
        "featured": True,
    },
    {
        "title": "Honda BeAT Street 2022",
        "category": "motor",
        "brand": "Honda",
        "year": 2022,
        "mileage": 12000,
        "price": 16500000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Hitam",
        "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Handil",
        "status": "Unit Ready",
        "description": "Matic harian irit, lincah untuk kota. Surat komplit BPKB tangan pertama.",
        "features": ["Tangan Pertama", "Irit", "Surat Komplit", "Mesin Halus"],
        "featured": False,
    },
    {
        "title": "Yamaha Aerox 155 ABS",
        "category": "motor",
        "brand": "Yamaha",
        "year": 2023,
        "mileage": 6800,
        "price": 29500000,
        "transmission": "Automatic",
        "fuel": "Bensin",
        "color": "Biru Doff",
        "image_url": "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "gallery": [
            "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        ],
        "location": "Balikpapan",
        "status": "Unit Ready",
        "description": "Sporty matic dengan tampang agresif. KM rendah, masih garansi.",
        "features": ["ABS", "KM Rendah", "Garansi", "Velg Racing"],
        "featured": False,
    },
]


@app.on_event("startup")
async def seed_data():
    count = await db.vehicles.count_documents({})
    if count == 0:
        docs = []
        for v in SEED_VEHICLES:
            obj = Vehicle(**v)
            d = obj.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            docs.append(d)
        if docs:
            await db.vehicles.insert_many(docs)
            logger.info(f"Seeded {len(docs)} vehicles")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
