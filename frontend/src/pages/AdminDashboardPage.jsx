import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatIDR, formatKm, LOGO_URL } from "@/lib/brand";
import { LogOut, Plus, Pencil, Trash2, Car, Wallet, Users, MessageSquare } from "lucide-react";

const emptyVehicle = {
  title: "",
  category: "mobil",
  brand: "",
  year: new Date().getFullYear(),
  mileage: 0,
  price: 0,
  transmission: "Manual",
  fuel: "Bensin",
  color: "",
  image_url: "",
  gallery: [],
  location: "Balikpapan",
  status: "Unit Ready",
  description: "",
  features: [],
  featured: false,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("ritri_admin_token");
    if (!t) { navigate("/admin/login"); return; }
    api.get("/admin/me")
      .then((r) => setMe(r.data))
      .catch(() => { localStorage.removeItem("ritri_admin_token"); navigate("/admin/login"); });
  }, [navigate]);

  const refresh = async () => {
    try {
      const [s, v, l] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/vehicles", { params: { limit: 100 } }),
        api.get("/leads"),
      ]);
      setStats(s.data); setVehicles(v.data); setLeads(l.data);
    } catch (e) { /* token may be invalid */ }
  };

  useEffect(() => { if (me) refresh(); }, [me]);

  const logout = async () => {
    try { await api.post("/admin/logout"); } catch {}
    localStorage.removeItem("ritri_admin_token");
    localStorage.removeItem("ritri_admin_user");
    navigate("/admin/login");
  };

  const openCreate = () => { setEditing({ ...emptyVehicle, _isNew: true }); setOpen(true); };
  const openEdit = (v) => { setEditing({ ...v, _isNew: false }); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing };
    delete payload._isNew;
    payload.year = Number(payload.year);
    payload.mileage = Number(payload.mileage);
    payload.price = Number(payload.price);
    if (typeof payload.features === "string") payload.features = payload.features.split(",").map(s => s.trim()).filter(Boolean);
    if (typeof payload.gallery === "string") payload.gallery = payload.gallery.split(",").map(s => s.trim()).filter(Boolean);
    try {
      if (editing._isNew) {
        await api.post("/vehicles", payload);
        toast.success("Unit ditambahkan");
      } else {
        await api.put(`/vehicles/${editing.id}`, payload);
        toast.success("Unit diperbarui");
      }
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Gagal menyimpan");
    }
  };

  const remove = async (v) => {
    if (!window.confirm(`Hapus "${v.title}"?`)) return;
    try {
      await api.delete(`/vehicles/${v.id}`);
      toast.success("Unit dihapus");
      refresh();
    } catch { toast.error("Gagal menghapus"); }
  };

  const removeLead = async (l) => {
    if (!window.confirm(`Hapus lead dari ${l.name}?`)) return;
    try {
      await api.delete(`/leads/${l.id}`);
      toast.success("Lead dihapus");
      refresh();
    } catch { toast.error("Gagal menghapus"); }
  };

  if (!me) return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Admin Header */}
      <header className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Ritri Auto" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/40" />
            <div>
              <div className="font-display font-semibold">Admin · Ritri Auto</div>
              <div className="text-xs text-slate-300">Halo, {me.username}</div>
            </div>
          </div>
          <Button onClick={logout} variant="ghost" data-testid="admin-logout" className="text-white hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
          <StatBox icon={<Car className="h-5 w-5" />} label="Total Unit" value={stats?.vehicles.total ?? "-"} />
          <StatBox icon={<Car className="h-5 w-5" />} label="Mobil" value={stats?.vehicles.mobil ?? "-"} />
          <StatBox icon={<Car className="h-5 w-5" />} label="Motor" value={stats?.vehicles.motor ?? "-"} />
          <StatBox icon={<Users className="h-5 w-5" />} label="Leads Baru" value={stats?.leads.new ?? "-"} highlight />
        </div>

        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles" data-testid="tab-vehicles">Katalog Kendaraan</TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">Leads ({stats?.leads.total ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-6">
            <div className="bg-white border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div>
                  <h2 className="font-display font-semibold text-navy text-lg">Daftar Kendaraan</h2>
                  <p className="text-sm text-slate-500">{vehicles.length} unit</p>
                </div>
                <Button onClick={openCreate} data-testid="admin-add-vehicle" className="bg-navy hover:bg-navy-light text-white rounded-none">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Unit
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>KM</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((v) => (
                      <TableRow key={v.id} data-testid={`admin-row-${v.id}`}>
                        <TableCell className="font-medium">{v.title}</TableCell>
                        <TableCell><Badge variant="outline">{v.category}</Badge></TableCell>
                        <TableCell>{v.year}</TableCell>
                        <TableCell>{formatKm(v.mileage)}</TableCell>
                        <TableCell>{formatIDR(v.price)}</TableCell>
                        <TableCell>{v.location}</TableCell>
                        <TableCell>{v.featured ? <Badge className="bg-gold text-navy">Featured</Badge> : "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(v)} data-testid={`admin-edit-${v.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(v)} className="text-destructive" data-testid={`admin-delete-${v.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <div className="bg-white border border-slate-200">
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-display font-semibold text-navy text-lg">Leads Masuk</h2>
                <p className="text-sm text-slate-500">{leads.length} pengajuan terbaru</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>WA</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((l) => (
                      <TableRow key={l.id} data-testid={`lead-row-${l.id}`}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell>
                          <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-navy hover:text-gold">
                            {l.phone}
                          </a>
                        </TableCell>
                        <TableCell><Badge variant="outline">{l.type}</Badge></TableCell>
                        <TableCell className="max-w-[280px]">
                          {l.vehicle_title && <div className="text-xs text-slate-500">Unit: {l.vehicle_title}</div>}
                          {l.loan_amount && <div className="text-xs text-slate-500">Pinjaman: {formatIDR(l.loan_amount)} · {l.tenor_months} bln</div>}
                          {l.message && <div className="text-sm">{l.message}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(l.created_at).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => removeLead(l)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="vehicle-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-navy">
              {editing?._isNew ? "Tambah Unit" : "Edit Unit"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Judul" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <div>
                <Label>Kategori</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobil">Mobil</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Brand" value={editing.brand} onChange={(v) => setEditing({ ...editing, brand: v })} />
              <Field label="Tahun" type="number" value={editing.year} onChange={(v) => setEditing({ ...editing, year: v })} />
              <Field label="Jarak Tempuh (km)" type="number" value={editing.mileage} onChange={(v) => setEditing({ ...editing, mileage: v })} />
              <Field label="Harga (Rp)" type="number" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} />
              <Field label="Transmisi" value={editing.transmission} onChange={(v) => setEditing({ ...editing, transmission: v })} />
              <Field label="Bahan Bakar" value={editing.fuel} onChange={(v) => setEditing({ ...editing, fuel: v })} />
              <Field label="Warna" value={editing.color} onChange={(v) => setEditing({ ...editing, color: v })} />
              <Field label="Lokasi" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} />
              <Field label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })} />
              <Field label="Image URL Utama" value={editing.image_url} onChange={(v) => setEditing({ ...editing, image_url: v })} full />
              <Field label="Gallery (URL, pisah koma)" value={Array.isArray(editing.gallery) ? editing.gallery.join(", ") : editing.gallery} onChange={(v) => setEditing({ ...editing, gallery: v })} full />
              <Field label="Fitur (pisah koma)" value={Array.isArray(editing.features) ? editing.features.join(", ") : editing.features} onChange={(v) => setEditing({ ...editing, features: v })} full />
              <div className="md:col-span-2">
                <Label>Deskripsi</Label>
                <Textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={!!editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                <span className="text-sm">Tampilkan sebagai Unit Featured di beranda</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} data-testid="vehicle-form-save" className="bg-navy hover:bg-navy-light text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ icon, label, value, highlight }) {
  return (
    <div className={`p-5 border ${highlight ? "border-gold/40 bg-gold/5" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className="text-gold">{icon}</span>
      </div>
      <div className="font-display font-bold text-navy text-2xl mt-2">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
