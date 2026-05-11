import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function CatalogPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "all") params.category = category;
    api.get("/vehicles", { params, limit: 100 })
      .then((r) => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    let arr = [...vehicles];
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter(v =>
        v.title.toLowerCase().includes(needle) ||
        v.brand.toLowerCase().includes(needle) ||
        v.location.toLowerCase().includes(needle)
      );
    }
    if (sort === "price-asc") arr.sort((a,b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a,b) => b.price - a.price);
    else if (sort === "year-desc") arr.sort((a,b) => b.year - a.year);
    return arr;
  }, [vehicles, q, sort]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Katalog Kendaraan</div>
          <h1 className="mt-3 font-display font-bold text-navy text-4xl sm:text-5xl tracking-tight">
            Unit ready di Balikpapan & Handil
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Semua unit telah diinspeksi oleh konsultan kami. Pilih unit favorit Anda dan langsung chat WhatsApp untuk survei.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-8" data-testid="catalog-filters">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                data-testid="catalog-search"
                placeholder="Cari brand, model, lokasi..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <div className="flex gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="catalog-category" className="w-[160px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="mobil">Mobil</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger data-testid="catalog-sort" className="w-[180px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price-asc">Harga Terendah</SelectItem>
                  <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
                  <SelectItem value="year-desc">Tahun Terbaru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500" data-testid="catalog-empty">
              Tidak ada unit yang cocok dengan filter Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="catalog-grid">
              {filtered.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
