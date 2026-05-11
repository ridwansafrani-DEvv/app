import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import LeadFormDialog from "@/components/LeadFormDialog";
import { Button } from "@/components/ui/button";
import { Car, Wallet, Repeat, ShieldCheck, MapPin, ArrowRight, CheckCircle2, Clock, Users, Star } from "lucide-react";
import api from "@/lib/api";
import { buildWhatsAppLink } from "@/lib/brand";

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vehicles", { params: { featured: true, limit: 8 } })
      .then((r) => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F8F9FA]" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 md:pt-16 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              <span className="h-px w-8 bg-gold" />
              Balikpapan · Handil · Kaltim
            </div>
            <h1 className="mt-5 font-display font-bold text-navy text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Solusi Kendaraan Bekas <span className="text-gold">&</span> Pendanaan Terpercaya
            </h1>
            <p className="mt-6 text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
              Menemukan motor dan mobil impian kini lebih mudah. Unit terinspeksi, proses
              transparan, dan solusi dana tunai <strong className="text-navy">Gadai BPKB</strong> yang aman bersama mitra leasing resmi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3" data-testid="hero-cta-group">
              <Link
                to="/katalog"
                data-testid="hero-cta-catalog"
                className="bg-navy text-white px-7 py-4 font-medium hover:bg-navy-light transition-colors inline-flex items-center gap-2"
              >
                Cari Kendaraan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/gadai-bpkb"
                data-testid="hero-cta-bpkb"
                className="border border-navy text-navy px-7 py-4 font-medium hover:bg-navy hover:text-white transition-colors inline-flex items-center gap-2"
              >
                Simulasi Gadai BPKB
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat number="500+" label="Klien Terlayani" />
              <Stat number="100%" label="Unit Terinspeksi" />
              <Stat number="10 mnt" label="Respon WA" />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative aspect-[5/4] overflow-hidden grain shadow-2xl shadow-slate-300/50">
              <img
                src="https://images.unsplash.com/photo-1763562137761-c1feadcf4261?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"
                alt="Premium Vehicle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-2 md:left-6 bg-white border border-slate-200 shadow-xl px-5 py-4 flex items-center gap-3 max-w-xs">
              <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="font-display font-semibold text-navy text-sm">Konsultan Resmi</div>
                <div className="text-xs text-slate-500">Pendampingan ke showroom rekanan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BRANDS MARQUEE */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold flex-shrink-0">
            Brand Rekanan
          </span>
          <div className="overflow-hidden no-scrollbar flex-1">
            <div className="flex items-center gap-10 text-slate-400 font-display font-semibold text-lg">
              {["TOYOTA", "HONDA", "YAMAHA", "MITSUBISHI", "DAIHATSU", "SUZUKI", "ADIRA", "BFI FINANCE", "MEGA AUTO"].map(b => (
                <span key={b} className="whitespace-nowrap hover:text-navy transition-colors">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-28" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Tiga Layanan Utama</div>
              <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl lg:text-5xl tracking-tight">
                Satu mitra untuk seluruh kebutuhan kendaraan Anda
              </h2>
            </div>
            <p className="text-slate-600 max-w-md text-base">
              Beli, jual, tukar tambah, hingga akses dana cepat via BPKB — semua dikelola oleh tim konsultan berpengalaman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <ServiceCard
              icon={<Car className="h-7 w-7" />}
              title="Beli Kendaraan"
              text="Kurasi motor matic dan mobil keluarga terbaik di Balikpapan. Setiap unit melewati inspeksi mekanik."
              cta="Lihat Katalog"
              to="/katalog"
              testId="service-beli"
            />
            <ServiceCard
              icon={<Repeat className="h-7 w-7" />}
              title="Jual & Tukar Tambah"
              text="Bantu jual kendaraan lama Anda dengan harga kompetitif. Estimasi cepat & transparan dalam hitungan jam."
              cta="Mulai Konsultasi"
              type="jual"
              testId="service-jual"
            />
            <ServiceCard
              icon={<Wallet className="h-7 w-7" />}
              title="Gadai BPKB"
              gold
              text="Solusi dana tunai cepat dengan mitra leasing resmi. Bunga ringan, proses singkat, BPKB aman."
              cta="Simulasi Pinjaman"
              to="/gadai-bpkb"
              testId="service-gadai"
            />
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-20 md:py-28 bg-[#F8F9FA]" data-testid="showcase-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Unit Pilihan</div>
              <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl lg:text-5xl tracking-tight">
                Rekomendasi unit ready
              </h2>
              <p className="mt-3 text-slate-600 max-w-xl">
                Setiap unit telah melewati pengecekan mesin, body, dan kelengkapan surat oleh konsultan kami.
              </p>
            </div>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group"
              data-testid="showcase-view-all"
            >
              Lihat semua unit
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="vehicle-grid">
              {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          )}
        </div>
      </section>

      {/* TRUST BUILDER */}
      <section className="py-20 md:py-28" data-testid="trust-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[5/4] overflow-hidden grain">
              <img
                src="https://images.unsplash.com/photo-1758518730384-be3d205838e8?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
                alt="Konsultasi profesional"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 md:right-6 bg-navy text-white px-6 py-5 max-w-xs">
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-2 text-sm italic">"Prosesnya rapi, dijemput ke showroom langsung. Beneran kayak punya orang dalam."</p>
              <p className="mt-2 text-xs text-slate-300">— Reza, Balikpapan</p>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Mengapa Ritri Auto</div>
            <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl lg:text-5xl tracking-tight">
              Mitra konsultan, bukan sekadar makelar.
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Ritri Auto Solution mendampingi Anda langsung ke lokasi showroom rekanan untuk
              memastikan setiap transaksi aman, transparan, dan menguntungkan. Kami tidak
              menyimpan unit — kami menyimpan kepercayaan.
            </p>

            <div className="mt-8 space-y-4">
              <Bullet icon={<ShieldCheck className="h-5 w-5" />} title="Transaksi Aman" text="Pendampingan langsung di showroom rekanan resmi." />
              <Bullet icon={<Users className="h-5 w-5" />} title="Konsultan Berpengalaman" text="Tim memahami pasar mobil & motor Kaltim secara mendalam." />
              <Bullet icon={<Clock className="h-5 w-5" />} title="Respon Cepat" text="Konsultasi via WhatsApp direspon dalam 10 menit di jam kerja." />
              <Bullet icon={<CheckCircle2 className="h-5 w-5" />} title="Transparan" text="Semua biaya, bunga, dan dokumen dijelaskan di awal. Tanpa fee tersembunyi." />
            </div>

            <div className="mt-9">
              <LeadFormDialog
                defaultType="kontak"
                title="Konsultasi Gratis"
                description="Ceritakan kebutuhan Anda — tim kami akan memberikan rekomendasi terbaik."
                trigger={
                  <Button data-testid="trust-cta-konsultasi" className="bg-navy hover:bg-navy-light text-white rounded-none px-8 py-6 font-medium">
                    Mulai Konsultasi Gratis
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIPE */}
      <section className="bg-navy text-white" data-testid="cta-band">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Butuh Dana Cepat?</div>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight">
              Cairkan dana via Gadai BPKB <span className="text-gold">— bunga ringan, BPKB tetap aman.</span>
            </h2>
            <p className="mt-4 text-slate-300 max-w-xl">
              Mitra leasing resmi (OJK). Plafon hingga 80% nilai kendaraan, tenor fleksibel 12–48 bulan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:justify-end gap-3">
            <Link
              to="/gadai-bpkb"
              data-testid="band-cta-bpkb"
              className="bg-gold text-navy px-8 py-4 font-semibold hover:bg-gold-light transition-colors text-center"
            >
              Simulasi Sekarang
            </Link>
            <a
              href={buildWhatsAppLink("Halo Ritri Auto, saya ingin konsultasi Gadai BPKB.")}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors text-center"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <div className="font-display font-bold text-navy text-2xl md:text-3xl">{number}</div>
      <div className="text-xs text-slate-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function ServiceCard({ icon, title, text, cta, to, type, gold, testId }) {
  const body = (
    <div className={`relative bg-white p-8 border ${gold ? "border-gold/40" : "border-slate-200"} hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group`}>
      <div className={`h-14 w-14 flex items-center justify-center ${gold ? "bg-gold text-navy" : "bg-navy text-white"} mb-6`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-navy text-xl md:text-2xl tracking-tight">{title}</h3>
      <p className="mt-3 text-slate-600 text-sm leading-relaxed flex-1">{text}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-navy font-medium text-sm group-hover:text-gold transition-colors">
        {cta} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} data-testid={testId} className="block h-full">{body}</Link>;
  }
  return (
    <LeadFormDialog
      defaultType={type}
      title={title}
      trigger={<button data-testid={testId} className="text-left h-full">{body}</button>}
    />
  );
}

function Bullet({ icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-10 w-10 bg-navy/5 text-navy flex items-center justify-center">{icon}</div>
      <div>
        <div className="font-display font-semibold text-navy">{title}</div>
        <div className="text-sm text-slate-600 mt-0.5">{text}</div>
      </div>
    </div>
  );
}
