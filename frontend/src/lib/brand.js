// Placeholder WhatsApp number — ganti via env atau langsung di file ini
export const WHATSAPP_NUMBER = "6282214287769";

export const BRAND = {
  name: "Ritri Auto Solution",
  shortName: "Ritri Auto",
  tagline: "Solusi Kendaraan & Pendanaan Terpercaya",
  locations: ["Balikpapan", "Handil"],
  email: "info@ritriautosolution.id",
};

export const buildWhatsAppLink = (text) => {
  const msg = encodeURIComponent(text || "Halo Ritri Auto, saya tertarik dengan layanan Anda.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
};

export const formatIDR = (n) => {
  if (n == null || isNaN(n)) return "Rp 0";
  return "Rp " + Number(n).toLocaleString("id-ID");
};

export const formatKm = (n) => {
  if (n == null || isNaN(n)) return "-";
  return Number(n).toLocaleString("id-ID") + " km";
};
