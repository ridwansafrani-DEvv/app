import React, { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatIDR, buildWhatsAppLink } from "@/lib/brand";
import { Wallet, ShieldCheck, Clock, FileCheck2, Percent, BadgeCheck } from "lucide-react";

const INTEREST_RATES = {
  motor: 0.018, // ~1.8% / bulan flat (estimasi)
  mobil: 0.012, // ~1.2% / bulan flat (estimasi)
};

export default function GadaiBpkbPage() {
  const [bpkbType, setBpkbType] = useState("mobil");
  const [estValue, setEstValue] = useState(150000000);
  const [pctLoan, setPctLoan] = useState(70);
  const [tenor, setTenor] = useState(24);

  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const loan = useMemo(() => Math.round((estValue * pctLoan) / 100), [estValue, pctLoan]);
  const rate = INTEREST_RATES[bpkbType] || 0.015;
  const totalInterest = useMemo(() => Math.round(loan * rate * tenor), [loan, rate, tenor]);
  const monthly = useMemo(() => {
    if (!loan || !tenor) return 0;
    return Math.round((loan + totalInterest) / tenor);
  }, [loan, totalInterest, tenor]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Nama dan nomor WhatsApp wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/leads", {
        name: form.name,
        phone: form.phone,
        type: "gadai",
        bpkb_type: bpkbType,
        estimated_value: estValue,
        loan_amount: loan,
        tenor_months: tenor,
        message: `Simulasi: cicilan ${formatIDR(monthly)}/bln, tenor ${tenor} bln.`,
      });
      toast.success("Pengajuan terkirim! Konsultan akan menghubungi Anda.");
      const waMsg = `Halo Ritri Auto, saya *${form.name}* (${form.phone}) ingin Gadai BPKB *${bpkbType}*. Estimasi nilai unit: ${formatIDR(estValue)}, pinjaman: ${formatIDR(loan)}, tenor: ${tenor} bulan, cicilan estimasi: ${formatIDR(monthly)}/bulan.`;
      window.open(buildWhatsAppLink(waMsg), "_blank");
      setForm({ name: "", phone: "" });
    } catch (err) {
      toast.error("Gagal mengirim. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="gadai-page">
      <Navbar />

      {/* HERO */}
      <section className="bg-navy text-white relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              <span className="h-px w-8 bg-gold" /> Gadai BPKB · Balikpapan & Handil
            </div>
            <h1 className="mt-5 font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              Cairkan dana tunai <span className="text-gold">tanpa kehilangan kendaraan.</span>
            </h1>
            <p className="mt-6 text-slate-300 max-w-xl leading-relaxed">
              Plafon hingga 80% nilai kendaraan, tenor fleksibel 12–48 bulan, bunga ringan via mitra leasing resmi terdaftar OJK. BPKB aman, kendaraan tetap di tangan Anda.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              <BadgeBlock icon={<Percent className="h-5 w-5" />} label="Bunga Mulai" value="1.2% / bln" />
              <BadgeBlock icon={<Clock className="h-5 w-5" />} label="Cair Cepat" value="1–3 Hari" />
              <BadgeBlock icon={<ShieldCheck className="h-5 w-5" />} label="Mitra Resmi" value="Terdaftar OJK" />
              <BadgeBlock icon={<FileCheck2 className="h-5 w-5" />} label="Proses" value="Mudah" />
            </div>
          </div>

          {/* Calculator */}
          <div className="bg-white text-navy p-7 md:p-9 shadow-2xl" data-testid="gadai-calculator">
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Simulasi Pinjaman</div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mt-2">Hitung Cicilan Anda</h2>
            <p className="text-sm text-slate-500 mt-1">Estimasi indikatif. Penawaran final mengikuti hasil survei.</p>

            <div className="mt-6 space-y-5">
              <div>
                <Label>Jenis Kendaraan</Label>
                <Select value={bpkbType} onValueChange={setBpkbType}>
                  <SelectTrigger data-testid="calc-bpkb-type" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobil">Mobil</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between">
                  <Label>Estimasi Nilai Kendaraan</Label>
                  <span className="font-display font-semibold text-navy text-sm">{formatIDR(estValue)}</span>
                </div>
                <Slider
                  data-testid="calc-est-value"
                  min={bpkbType === "motor" ? 5000000 : 50000000}
                  max={bpkbType === "motor" ? 50000000 : 700000000}
                  step={1000000}
                  value={[estValue]}
                  onValueChange={(v) => setEstValue(v[0])}
                  className="mt-3"
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <Label>Persentase Pinjaman</Label>
                  <span className="font-display font-semibold text-navy text-sm">{pctLoan}% · {formatIDR(loan)}</span>
                </div>
                <Slider
                  data-testid="calc-pct-loan"
                  min={30}
                  max={80}
                  step={5}
                  value={[pctLoan]}
                  onValueChange={(v) => setPctLoan(v[0])}
                  className="mt-3"
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <Label>Tenor (bulan)</Label>
                  <span className="font-display font-semibold text-navy text-sm">{tenor} bulan</span>
                </div>
                <Slider
                  data-testid="calc-tenor"
                  min={12}
                  max={48}
                  step={6}
                  value={[tenor]}
                  onValueChange={(v) => setTenor(v[0])}
                  className="mt-3"
                />
              </div>

              <div className="mt-6 p-5 bg-navy text-white">
                <div className="text-xs uppercase tracking-wider text-gold">Estimasi Cicilan / Bulan</div>
                <div className="font-display font-bold text-3xl mt-1" data-testid="calc-monthly">{formatIDR(monthly)}</div>
                <div className="text-xs text-slate-300 mt-2">
                  Pinjaman: {formatIDR(loan)} · Bunga total est.: {formatIDR(totalInterest)}
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                data-testid="calc-input-name"
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                data-testid="calc-input-phone"
                placeholder="No. WhatsApp"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <Button
                type="submit"
                disabled={submitting}
                data-testid="calc-submit"
                className="sm:col-span-2 bg-gold hover:bg-gold-light text-navy font-semibold rounded-none py-6"
              >
                {submitting ? "Mengirim..." : "Ajukan Sekarang"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Alur Pengajuan</div>
            <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl tracking-tight">4 Langkah Mudah & Aman</h2>
            <p className="mt-4 text-slate-600">Pengajuan didampingi konsultan kami dari awal sampai dana cair.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Konsultasi WA", d: "Chat kami, sampaikan kebutuhan & detail kendaraan." },
              { n: "02", t: "Survei Cepat", d: "Tim survei datang ke lokasi Anda di Balikpapan / Handil." },
              { n: "03", t: "Verifikasi Dokumen", d: "Cek BPKB, KTP, KK, dan STNK. Semua transparan." },
              { n: "04", t: "Dana Cair", d: "Dana langsung ditransfer ke rekening Anda — 1–3 hari kerja." },
            ].map((s, i) => (
              <div key={i} className="bg-white p-7 border border-slate-200 hover:border-gold/40 hover:shadow-lg transition-all">
                <div className="font-display font-bold text-gold text-3xl">{s.n}</div>
                <div className="mt-4 font-display font-semibold text-navy text-lg">{s.t}</div>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="bg-[#F8F9FA] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Syarat Mudah</div>
            <h2 className="mt-3 font-display font-bold text-navy text-3xl md:text-4xl tracking-tight">Dokumen yang perlu disiapkan</h2>
            <p className="mt-4 text-slate-600">Kami hanya bantu cairkan dana — BPKB tetap aman tersimpan di mitra leasing resmi.</p>
          </div>
          <div>
            <ul className="space-y-3">
              {[
                "BPKB asli (motor / mobil) atas nama sendiri atau keluarga",
                "STNK asli & pajak hidup",
                "KTP, KK, dan dokumen pendukung",
                "Usia kendaraan max. 15 tahun (mobil) / 10 tahun (motor)",
                "Domisili Balikpapan / Handil / sekitarnya",
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-3 bg-white p-4 border border-slate-200">
                  <BadgeCheck className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function BadgeBlock({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-3">
      <div className="text-gold">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-2">{label}</div>
      <div className="font-display font-semibold text-white text-sm mt-0.5">{value}</div>
    </div>
  );
}
