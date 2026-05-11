import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { buildWhatsAppLink } from "@/lib/brand";
import { useSettings } from "@/lib/settings";
import { Phone, MapPin, Mail, MessageCircle, Clock, Instagram } from "lucide-react";

export default function ContactPage() {
  const { settings } = useSettings();
  const wa = settings.whatsapp_number;
  const waDigits = (wa || "").replace(/\D/g, "");
  const [form, setForm] = useState({ name: "", phone: "", type: "kontak", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Nama dan WhatsApp wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await api.post("/leads", form);
      toast.success("Pesan terkirim. Tim kami akan segera menghubungi Anda.");
      setForm({ name: "", phone: "", type: "kontak", message: "" });
    } catch {
      toast.error("Gagal mengirim. Coba via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="contact-page">
      <Navbar />
      <section className="bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Hubungi Kami</div>
          <h1 className="mt-3 font-display font-bold text-navy text-4xl sm:text-5xl tracking-tight">
            Konsultasi langsung dengan tim kami
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl">
            Tim Ritri Auto Solution siap membantu Anda di Balikpapan & Handil. Pilih channel termudah — kami biasanya respon dalam 10 menit di jam kerja.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-5">
            <InfoCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="WhatsApp"
              text={`+${waDigits}`}
              cta="Chat Sekarang"
              href={buildWhatsAppLink(null, wa)}
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              title="Telepon"
              text={`+${waDigits}`}
              cta="Hubungi"
              href={`tel:+${waDigits}`}
            />
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              text={settings.email}
              cta="Kirim Email"
              href={`mailto:${settings.email}`}
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              title="Area Layanan"
              text={settings.address}
              subtext="Kami juga mendampingi survei ke showroom rekanan."
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              title="Jam Operasional"
              text={settings.business_hours}
              subtext={settings.business_hours_note}
            />
            <InfoCard
              icon={<Instagram className="h-5 w-5" />}
              title="Instagram"
              text={settings.instagram_handle}
            />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="bg-white border border-slate-200 p-7 md:p-9" data-testid="contact-form">
            <h2 className="font-display font-bold text-navy text-2xl">Kirim Pesan</h2>
            <p className="text-sm text-slate-500 mt-1">Konsultan kami akan menghubungi Anda kembali.</p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="cn">Nama Lengkap</Label>
                <Input id="cn" data-testid="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="cp">No. WhatsApp</Label>
                <Input id="cp" data-testid="contact-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <Label>Jenis Layanan</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger data-testid="contact-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beli">Beli Kendaraan</SelectItem>
                    <SelectItem value="jual">Jual / Tukar Tambah</SelectItem>
                    <SelectItem value="gadai">Gadai BPKB</SelectItem>
                    <SelectItem value="kontak">Tanya Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cm">Pesan</Label>
                <Textarea id="cm" data-testid="contact-message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button
                type="submit"
                disabled={loading}
                data-testid="contact-submit"
                className="w-full bg-navy hover:bg-navy-light text-white rounded-none py-6 font-medium"
              >
                {loading ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function InfoCard({ icon, title, text, subtext, cta, href }) {
  return (
    <div className="bg-white border border-slate-200 p-5 flex items-start gap-4 hover:border-gold/40 hover:shadow-lg transition-all">
      <div className="h-10 w-10 flex items-center justify-center bg-navy text-gold flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{title}</div>
        <div className="font-display font-semibold text-navy mt-1">{text}</div>
        {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
      </div>
      {cta && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-navy hover:text-gold whitespace-nowrap">
          {cta} →
        </a>
      )}
    </div>
  );
}
