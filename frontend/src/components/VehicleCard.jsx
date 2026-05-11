import React from "react";
import { Link } from "react-router-dom";
import { formatIDR, formatKm, buildWhatsAppLink } from "@/lib/brand";
import { useSettings } from "@/lib/settings";
import { MapPin, Gauge, Calendar } from "lucide-react";

export default function VehicleCard({ vehicle }) {
  const { settings } = useSettings();
  const msg = `Halo Ritri Auto, saya tertarik dengan unit *${vehicle.title}* tahun ${vehicle.year} (${formatIDR(vehicle.price)}). Mohon info lebih lanjut.`;
  return (
    <article
      data-testid={`vehicle-card-${vehicle.id}`}
      className="group bg-white border border-slate-200/80 overflow-hidden hover:border-gold/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col"
    >
      <Link to={`/kendaraan/${vehicle.id}`} className="relative block overflow-hidden bg-slate-100">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={vehicle.image_url}
            alt={vehicle.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-navy text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider shadow-sm">
          {vehicle.status} · {vehicle.location}
        </span>
        <span className="absolute top-3 right-3 bg-navy text-white text-[10px] font-bold px-2.5 py-1.5 uppercase tracking-wider">
          {vehicle.category === "motor" ? "Motor" : "Mobil"}
        </span>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{vehicle.brand}</div>
        <Link to={`/kendaraan/${vehicle.id}`}>
          <h3 className="mt-1 font-display font-semibold text-lg text-navy leading-snug line-clamp-2 group-hover:text-navy-light">
            {vehicle.title}
          </h3>
        </Link>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gold" /> {vehicle.year}
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-gold" /> {formatKm(vehicle.mileage)}
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-gold" /> {vehicle.location}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between gap-3 mt-auto">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Harga</div>
            <div className="font-display font-bold text-navy text-lg leading-tight">
              {formatIDR(vehicle.price)}
            </div>
          </div>
          <a
            href={buildWhatsAppLink(msg, settings.whatsapp_number)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`vehicle-wa-${vehicle.id}`}
            className="bg-navy text-white text-xs font-medium px-4 py-2.5 hover:bg-navy-light transition-colors"
          >
            Tanya WA
          </a>
        </div>
      </div>
    </article>
  );
}
