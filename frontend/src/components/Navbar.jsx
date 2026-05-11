import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND, LOGO_URL } from "@/lib/brand";

const navItems = [
  { to: "/", label: "Beranda", end: true },
  { to: "/katalog", label: "Katalog" },
  { to: "/gadai-bpkb", label: "Gadai BPKB" },
  { to: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-lg border-b border-slate-200" : "bg-transparent"
      }`}
      data-testid="site-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-logo">
          <img
            src={LOGO_URL}
            alt="Ritri Auto Solution"
            className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
          />
          <div className="leading-tight">
            <div className="font-display font-bold text-navy text-base md:text-lg tracking-tight">
              {BRAND.name}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 -mt-0.5">
              Balikpapan · Handil
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-navy" : "text-slate-600 hover:text-navy"
                }`
              }
              data-testid={`nav-link-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-gold" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <Link
            to="/gadai-bpkb"
            data-testid="nav-cta-bpkb"
            className="bg-navy text-white px-5 py-2.5 text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Konsultasi Gadai BPKB
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-navy"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200" data-testid="mobile-menu">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `py-3 text-base ${isActive ? "text-navy font-semibold" : "text-slate-600"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/gadai-bpkb"
              className="mt-3 bg-navy text-white px-5 py-3 text-sm font-medium text-center"
            >
              Konsultasi Gadai BPKB
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
