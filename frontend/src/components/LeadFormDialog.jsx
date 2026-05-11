import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { buildWhatsAppLink } from "@/lib/brand";
import { useSettings } from "@/lib/settings";

export default function LeadFormDialog({ trigger, defaultType = "beli", vehicle, title, description }) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    type: defaultType,
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Nama dan nomor WhatsApp wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        type: form.type,
        message: form.message,
        vehicle_id: vehicle?.id || null,
        vehicle_title: vehicle?.title || null,
      };
      await api.post("/leads", payload);
      toast.success("Permintaan terkirim! Tim kami akan menghubungi Anda segera.");
      const waMsg = `Halo Ritri Auto, saya *${form.name}* (${form.phone}) tertarik dengan layanan *${labelOfType(form.type)}*${vehicle ? ` untuk unit *${vehicle.title}*` : ""}. ${form.message}`;
      window.open(buildWhatsAppLink(waMsg, settings.whatsapp_number), "_blank");
      setOpen(false);
      setForm({ name: "", phone: "", type: defaultType, message: "" });
    } catch (err) {
      toast.error("Gagal mengirim. Coba lagi atau hubungi via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="lead-form-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-navy text-2xl">
            {title || "Konsultasi Gratis"}
          </DialogTitle>
          <DialogDescription>
            {description || "Isi data berikut, tim Ritri Auto akan menghubungi Anda dalam 10 menit (jam kerja)."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="lead-name">Nama Lengkap</Label>
            <Input
              id="lead-name"
              data-testid="lead-input-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama Anda"
              required
            />
          </div>
          <div>
            <Label htmlFor="lead-phone">No. WhatsApp</Label>
            <Input
              id="lead-phone"
              data-testid="lead-input-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              type="tel"
              required
            />
          </div>
          <div>
            <Label>Jenis Layanan</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger data-testid="lead-input-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beli">Beli Kendaraan</SelectItem>
                <SelectItem value="jual">Jual / Tukar Tambah</SelectItem>
                <SelectItem value="gadai">Gadai BPKB</SelectItem>
                <SelectItem value="kontak">Tanya Umum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lead-message">Pesan (opsional)</Label>
            <Textarea
              id="lead-message"
              data-testid="lead-input-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Ceritakan kebutuhan Anda..."
              rows={3}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            data-testid="lead-submit-button"
            className="w-full bg-navy hover:bg-navy-light text-white rounded-none py-6 font-medium"
          >
            {loading ? "Mengirim..." : "Kirim & Lanjutkan ke WhatsApp"}
          </Button>
          <p className="text-xs text-slate-500 text-center">
            Data Anda aman & hanya digunakan untuk follow-up konsultasi.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const labelOfType = (t) => {
  switch (t) {
    case "beli": return "Beli Kendaraan";
    case "jual": return "Jual / Tukar Tambah";
    case "gadai": return "Gadai BPKB";
    default: return "Konsultasi";
  }
};
