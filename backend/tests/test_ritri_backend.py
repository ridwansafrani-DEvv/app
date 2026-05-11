"""Ritri Auto Solution backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://kendaraan-terpercaya.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ============ FIXTURES ============
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "ritri2025"}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.text}"
    data = r.json()
    assert "token" in data and data["username"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ============ HEALTH ============
def test_health():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d.get("status") == "ok"


# ============ VEHICLES (public) ============
def test_list_vehicles_seeded():
    r = requests.get(f"{API}/vehicles", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 8, f"Expected >=8 seeded vehicles, got {len(data)}"
    # No _id leak
    for v in data:
        assert "_id" not in v
        assert "id" in v and "title" in v and "category" in v


def test_filter_motor():
    r = requests.get(f"{API}/vehicles", params={"category": "motor"}, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all(v["category"] == "motor" for v in data)


def test_filter_mobil():
    r = requests.get(f"{API}/vehicles", params={"category": "mobil"}, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all(v["category"] == "mobil" for v in data)


def test_filter_featured():
    r = requests.get(f"{API}/vehicles", params={"featured": "true"}, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all(v["featured"] is True for v in data)


def test_get_vehicle_by_id():
    r = requests.get(f"{API}/vehicles", timeout=10)
    vid = r.json()[0]["id"]
    r2 = requests.get(f"{API}/vehicles/{vid}", timeout=10)
    assert r2.status_code == 200
    assert r2.json()["id"] == vid
    assert "_id" not in r2.json()


def test_get_vehicle_404():
    r = requests.get(f"{API}/vehicles/nonexistent-id-xyz", timeout=10)
    assert r.status_code == 404


# ============ LEADS (public POST) ============
def test_create_lead_gadai():
    payload = {
        "name": "TEST_Budi",
        "phone": "081234567890",
        "type": "gadai",
        "bpkb_type": "mobil",
        "estimated_value": 200000000,
        "loan_amount": 140000000,
        "tenor_months": 24,
        "message": "Mau gadai bpkb mobil",
    }
    r = requests.post(f"{API}/leads", json=payload, timeout=10)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["type"] == "gadai"
    assert d["bpkb_type"] == "mobil"
    assert d["estimated_value"] == 200000000
    assert d["loan_amount"] == 140000000
    assert d["tenor_months"] == 24
    assert "id" in d
    assert "_id" not in d


def test_create_lead_beli():
    payload = {"name": "TEST_Andi", "phone": "0811", "type": "beli", "vehicle_id": "abc", "vehicle_title": "Test"}
    r = requests.post(f"{API}/leads", json=payload, timeout=10)
    assert r.status_code == 200
    assert r.json()["type"] == "beli"


def test_create_lead_kontak():
    payload = {"name": "TEST_Citra", "phone": "0822", "type": "kontak", "message": "Tanya info"}
    r = requests.post(f"{API}/leads", json=payload, timeout=10)
    assert r.status_code == 200
    assert r.json()["type"] == "kontak"


# ============ ADMIN AUTH ============
def test_admin_login_wrong():
    r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_admin_me_requires_auth():
    r = requests.get(f"{API}/admin/me", timeout=10)
    assert r.status_code in (401, 403)


def test_admin_me_with_token(admin_headers):
    r = requests.get(f"{API}/admin/me", headers=admin_headers, timeout=10)
    assert r.status_code == 200
    assert r.json()["username"] == "admin"


def test_admin_stats(admin_headers):
    r = requests.get(f"{API}/admin/stats", headers=admin_headers, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "vehicles" in d and "leads" in d
    assert d["vehicles"]["total"] >= 8
    assert isinstance(d["leads"]["total"], int)


def test_leads_list_requires_auth():
    r = requests.get(f"{API}/leads", timeout=10)
    assert r.status_code in (401, 403)


def test_leads_list_with_auth(admin_headers):
    r = requests.get(f"{API}/leads", headers=admin_headers, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # at least the ones we created
    for lead in data:
        assert "_id" not in lead


# ============ VEHICLES (admin CRUD + verify) ============
def test_vehicles_create_requires_auth():
    r = requests.post(f"{API}/vehicles", json={"title": "x"}, timeout=10)
    assert r.status_code in (401, 403, 422)


def test_vehicle_crud_flow(admin_headers):
    payload = {
        "title": "TEST_Suzuki Ertiga",
        "category": "mobil",
        "brand": "Suzuki",
        "year": 2020,
        "mileage": 50000,
        "price": 175000000,
        "image_url": "https://example.com/x.jpg",
        "featured": False,
    }
    r = requests.post(f"{API}/vehicles", json=payload, headers=admin_headers, timeout=10)
    assert r.status_code == 200, r.text
    created = r.json()
    vid = created["id"]
    assert created["title"] == "TEST_Suzuki Ertiga"
    assert "_id" not in created

    # GET verify
    r2 = requests.get(f"{API}/vehicles/{vid}", timeout=10)
    assert r2.status_code == 200
    assert r2.json()["title"] == "TEST_Suzuki Ertiga"

    # PUT update
    r3 = requests.put(f"{API}/vehicles/{vid}", json={"price": 180000000, "featured": True}, headers=admin_headers, timeout=10)
    assert r3.status_code == 200
    assert r3.json()["price"] == 180000000
    assert r3.json()["featured"] is True

    # GET verify update
    r4 = requests.get(f"{API}/vehicles/{vid}", timeout=10)
    assert r4.json()["price"] == 180000000

    # DELETE
    r5 = requests.delete(f"{API}/vehicles/{vid}", headers=admin_headers, timeout=10)
    assert r5.status_code == 200

    # Verify gone
    r6 = requests.get(f"{API}/vehicles/{vid}", timeout=10)
    assert r6.status_code == 404


# ============ LEAD DELETE ============
def test_lead_delete_requires_auth():
    r = requests.delete(f"{API}/leads/some-id", timeout=10)
    assert r.status_code in (401, 403)


def test_lead_create_and_delete(admin_headers):
    r = requests.post(f"{API}/leads", json={"name": "TEST_DEL", "phone": "0", "type": "kontak"}, timeout=10)
    lid = r.json()["id"]
    rd = requests.delete(f"{API}/leads/{lid}", headers=admin_headers, timeout=10)
    assert rd.status_code == 200
    # verify gone via list
    r2 = requests.get(f"{API}/leads", headers=admin_headers, timeout=10)
    assert all(l["id"] != lid for l in r2.json())
