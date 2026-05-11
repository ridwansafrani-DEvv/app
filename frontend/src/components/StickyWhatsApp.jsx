import React from "react";
import { buildWhatsAppLink } from "@/lib/brand";
import { useSettings } from "@/lib/settings";
import { MessageCircle } from "lucide-react";

export default function StickyWhatsApp({ message }) {
  const { settings } = useSettings();
  const href = buildWhatsAppLink(
    message ||
      "Halo Ritri Auto, saya tertarik untuk konsultasi mengenai kendaraan / Gadai BPKB. Mohon info lebih lanjut.",
    settings.whatsapp_number
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="sticky-whatsapp-button"
      aria-label="Hubungi via WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-emerald-900/30 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 group"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/20 animate-ping" />
        <MessageCircle className="h-5 w-5 relative" strokeWidth={2.2} />
      </span>
      <span className="font-medium text-sm hidden sm:inline">Chat Sekarang</span>
    </a>
  );
}
