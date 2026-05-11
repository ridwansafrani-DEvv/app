import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const DEFAULTS = {
  brand_name: "Ritri Auto Solution",
  brand_short: "Balikpapan · Handil",
  hero_overline: "Balikpapan · Handil · Kaltim",
  hero_headline_1: "Solusi Kendaraan Bekas",
  hero_headline_amp: "&",
  hero_headline_2: "Pendanaan Terpercaya",
  hero_subheadline:
    "Menemukan motor dan mobil impian kini lebih mudah. Unit terinspeksi, proses transparan, dan solusi dana tunai Gadai BPKB yang aman bersama mitra leasing resmi.",
  stat_1_number: "500+",
  stat_1_label: "Klien Terlayani",
  stat_2_number: "100%",
  stat_2_label: "Unit Terinspeksi",
  stat_3_number: "10 mnt",
  stat_3_label: "Respon WA",
  whatsapp_number: "6282214287769",
  email: "info@ritriautosolution.id",
  address: "Balikpapan & Handil, Kalimantan Timur",
  business_hours: "Senin – Sabtu · 08.00 – 20.00 WITA",
  business_hours_note: "Minggu / Libur: chat WA tetap aktif.",
  instagram_handle: "@ritriautosolution",
  footer_about:
    "Mitra konsultan profesional untuk pembelian, penjualan, tukar tambah kendaraan bekas dan solusi dana tunai Gadai BPKB di Balikpapan & Handil.",
};

const SettingsContext = createContext({ settings: DEFAULTS, refresh: () => {}, loading: true });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings({ ...DEFAULTS, ...data });
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, refresh, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

export const buildWa = (phone, text) => {
  const number = (phone || "6282214287769").replace(/\D/g, "");
  const msg = encodeURIComponent(text || "Halo Ritri Auto, saya tertarik dengan layanan Anda.");
  return `https://wa.me/${number}?text=${msg}`;
};
