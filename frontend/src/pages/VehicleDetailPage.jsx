import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadFormDialog from "@/components/LeadFormDialog";
import api from "@/lib/api";
import { formatIDR, formatKm, buildWhatsAppLink } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Calendar, Gauge, MapPin, Fuel, Settings2, Palette, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/vehicles/${id}`)
      .then((r) => setVehicle(r.data))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-slate-100 animate-pulse" />
            <div className="h-6 w-1/2 bg-slate-100 animate-pulse" />
            <div className="h-32 w-full bg-slate-100 animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-3xl text-navy">Kendaraan tidak ditemukan</h1>
          <p className="mt-3 text-slate-600">Unit yang Anda cari mungkin sudah terjual atau tidak tersedia.</p>
          <Link to="/katalog" className="mt-6 inline-block bg-navy text-white px-6 py-3">Kembali ke Katalog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = vehicle.gallery?.length ? vehicle.gallery : [vehicle.image_url];
  const waMsg = `Halo Ritri Auto, saya tertarik dengan unit *${vehicle.title}* (${vehicle.year}) seharga ${formatIDR(vehicle.price)}. Apakah unit masih ready dan bisa survei langsung?`;

  return (
    <div className="min-h-screen bg-white" data-testid="vehicle-detail">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <Link to="/katalog" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <img src={gallery[activeImage]} alt={vehicle.title} className="w-full h-full object-cover" />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-navy text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
              {vehicle.status} · {vehicle.location}
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-[4/3] overflow-hidden border-2 transition-colors ${activeImage === i ? "border-gold" : "border-transparent"}`}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">{vehicle.brand} · {vehicle.category === "motor" ? "Motor" : "Mobil"}</div>
          <h1 className="mt-2 font-display font-bold text-navy text-3xl md:text-4xl tracking-tight">{vehicle.title}</h1>

          <div className="mt-6 pb-6 border-b border-slate-200">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Harga</div>
            <div className="font-display font-bold text-navy text-4xl mt-1">{formatIDR(vehicle.price)}</div>
            <div className="text-xs text-slate-500 mt-1">Nego di tempat · Bisa via leasing (TDP ringan)</div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Spec icon={<Calendar className="h-4 w-4 text-gold" />} label="Tahun" value={vehicle.year} />
            <Spec icon={<Gauge className="h-4 w-4 text-gold" />} label="Jarak Tempuh" value={formatKm(vehicle.mileage)} />
            <Spec icon={<Settings2 className="h-4 w-4 text-gold" />} label="Transmisi" value={vehicle.transmission} />
            <Spec icon={<Fuel className="h-4 w-4 text-gold" />} label="Bahan Bakar" value={vehicle.fuel} />
            <Spec icon={<Palette className="h-4 w-4 text-gold" />} label="Warna" value={vehicle.color || "-"} />
            <Spec icon={<MapPin className="h-4 w-4 text-gold" />} label="Lokasi" value={vehicle.location} />
          </dl>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={buildWhatsAppLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="detail-cta-whatsapp"
              className="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-7 py-4 font-medium transition-colors text-center"
            >
              Tanya via WhatsApp
            </a>
            <LeadFormDialog
              defaultType="beli"
              vehicle={vehicle}
              title={`Pesan: ${vehicle.title}`}
              description="Isi data berikut, tim kami akan mengatur jadwal survei langsung ke showroom rekanan."
              trigger={
                <Button data-testid="detail-cta-survey" className="bg-navy hover:bg-navy-light text-white rounded-none px-7 py-6 font-medium">
                  Jadwalkan Survei Unit
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Description & Features */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display font-bold text-navy text-2xl">Deskripsi Unit</h2>
            <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-line">
              {vehicle.description || "Unit dalam kondisi prima, sudah diinspeksi oleh tim kami. Silakan hubungi untuk informasi lebih detail."}
            </p>
          </div>
          {vehicle.features?.length > 0 && (
            <div className="lg:col-span-5">
              <h2 className="font-display font-bold text-navy text-2xl">Fitur & Keunggulan</h2>
              <ul className="mt-4 space-y-3">
                {vehicle.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Cross-sell CTA */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Butuh Pendanaan?</div>
          <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl">Mau bayar via leasing atau butuh dana cepat?</h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            Kami bantu uruskan kredit kendaraan atau cairkan dana via Gadai BPKB Anda yang sekarang.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/gadai-bpkb" className="bg-navy text-white px-7 py-4 hover:bg-navy-light transition-colors inline-flex items-center gap-2">
              Simulasi Gadai BPKB <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/katalog" className="border border-navy text-navy px-7 py-4 hover:bg-navy hover:text-white transition-colors">
              Lihat Unit Lainnya
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Spec({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
        <div className="font-medium text-navy">{value}</div>
      </div>
    </div>
  );
}
