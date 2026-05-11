import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings";
import { Save, RefreshCw } from "lucide-react";

export default function SettingsPanel() {
  const { refresh } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data)).catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await api.put("/settings", form);
      await refresh();
      toast.success("Pengaturan disimpan & tampil di website");
    } catch (e) {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-8 text-slate-500">Memuat pengaturan...</div>;

  return (
    <div className="space-y-8" data-testid="settings-panel">
      <Section title="Identitas Brand" subtitle="Nama yang tampil di Navbar, Footer & halaman.">
        <Row label="Nama Brand">
          <Input data-testid="set-brand-name" value={form.brand_name} onChange={(e) => update("brand_name", e.target.value)} />
        </Row>
        <Row label="Tagline Singkat (di bawah nama)">
          <Input value={form.brand_short} onChange={(e) => update("brand_short", e.target.value)} placeholder="Balikpapan · Handil" />
        </Row>
      </Section>

      <Section title="Hero Beranda" subtitle="Tampilan paling atas halaman beranda.">
        <Row label="Overline / Label Lokasi">
          <Input value={form.hero_overline} onChange={(e) => update("hero_overline", e.target.value)} />
        </Row>
        <Row label="Headline Bagian 1">
          <Input data-testid="set-hero-1" value={form.hero_headline_1} onChange={(e) => update("hero_headline_1", e.target.value)} />
        </Row>
        <Row label="Aksen Tengah (biasanya &)">
          <Input value={form.hero_headline_amp} onChange={(e) => update("hero_headline_amp", e.target.value)} className="max-w-[100px]" />
        </Row>
        <Row label="Headline Bagian 2">
          <Input data-testid="set-hero-2" value={form.hero_headline_2} onChange={(e) => update("hero_headline_2", e.target.value)} />
        </Row>
        <Row label="Sub-headline (deskripsi)">
          <Textarea rows={3} value={form.hero_subheadline} onChange={(e) => update("hero_subheadline", e.target.value)} />
        </Row>
      </Section>

      <Section title="Statistik Hero" subtitle="3 angka kecil di bawah tombol CTA hero.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 p-4 rounded">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Stat #{i}</div>
              <Input
                placeholder="Angka (mis. 500+)"
                className="mb-2"
                value={form[`stat_${i}_number`]}
                onChange={(e) => update(`stat_${i}_number`, e.target.value)}
              />
              <Input
                placeholder="Label (mis. Klien Terlayani)"
                value={form[`stat_${i}_label`]}
                onChange={(e) => update(`stat_${i}_label`, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Kontak" subtitle="Dipakai di Footer, halaman Kontak & tombol WhatsApp.">
        <Row label="Nomor WhatsApp (format 62xxx, tanpa +/spasi)">
          <Input data-testid="set-wa" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="6282214287769" />
        </Row>
        <Row label="Email">
          <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Row>
        <Row label="Alamat / Area Layanan">
          <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Row>
        <Row label="Jam Operasional">
          <Input value={form.business_hours} onChange={(e) => update("business_hours", e.target.value)} />
        </Row>
        <Row label="Catatan Jam Operasional">
          <Input value={form.business_hours_note} onChange={(e) => update("business_hours_note", e.target.value)} />
        </Row>
        <Row label="Instagram">
          <Input value={form.instagram_handle} onChange={(e) => update("instagram_handle", e.target.value)} placeholder="@ritriautosolution" />
        </Row>
      </Section>

      <Section title="Footer" subtitle="Teks deskripsi di kolom kiri footer.">
        <Row label="Tentang (footer)">
          <Textarea rows={3} value={form.footer_about} onChange={(e) => update("footer_about", e.target.value)} />
        </Row>
      </Section>

      <div className="sticky bottom-4 flex justify-end gap-3 bg-white border border-slate-200 p-4 shadow-lg">
        <Button variant="outline" onClick={() => api.get("/settings").then((r) => { setForm(r.data); toast.info("Dimuat ulang dari server"); })}>
          <RefreshCw className="h-4 w-4 mr-2" /> Reset Form
        </Button>
        <Button onClick={save} disabled={saving} data-testid="settings-save" className="bg-navy hover:bg-navy-light text-white rounded-none px-7">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-slate-200 p-6">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h3 className="font-display font-semibold text-navy text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
