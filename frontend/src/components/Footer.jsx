import React from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, Mail, Instagram } from "lucide-react";
import { BRAND, buildWhatsAppLink, WHATSAPP_NUMBER, LOGO_URL } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="bg-navy text-white" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Ritri Auto Solution"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/40"
            />
            <div className="font-display font-bold text-xl">{BRAND.name}</div>
          </div>
          <p className="mt-5 text-slate-300 max-w-md leading-relaxed text-sm">
            Mitra konsultan profesional untuk pembelian, penjualan, tukar tambah kendaraan
            bekas dan solusi dana tunai Gadai BPKB di Balikpapan & Handil.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold/60" />
            Konsultan Resmi · Bukan Showroom
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Navigasi</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/" className="hover:text-gold transition-colors">Beranda</Link></li>
            <li><Link to="/katalog" className="hover:text-gold transition-colors">Katalog Kendaraan</Link></li>
            <li><Link to="/gadai-bpkb" className="hover:text-gold transition-colors">Gadai BPKB</Link></li>
            <li><Link to="/kontak" className="hover:text-gold transition-colors">Kontak</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Kontak</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>Balikpapan & Handil, Kalimantan Timur</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                +{WHATSAPP_NUMBER}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-gold">{BRAND.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <Instagram className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>@ritriautosolution</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>© {new Date().getFullYear()} {BRAND.name}. Semua hak dilindungi.</span>
          <span>Konsultan kendaraan & pendanaan profesional · Balikpapan</span>
        </div>
      </div>
    </footer>
  );
}
