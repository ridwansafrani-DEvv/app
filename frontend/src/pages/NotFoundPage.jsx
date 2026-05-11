import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <div className="text-gold font-display font-bold text-7xl">404</div>
        <h1 className="mt-3 font-display text-3xl text-navy">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <Link to="/" className="mt-7 inline-block bg-navy text-white px-7 py-3 hover:bg-navy-light transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
      <Footer />
    </div>
  );
}
