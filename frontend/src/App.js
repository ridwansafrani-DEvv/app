import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import VehicleDetailPage from "@/pages/VehicleDetailPage";
import GadaiBpkbPage from "@/pages/GadaiBpkbPage";
import ContactPage from "@/pages/ContactPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import StickyWhatsApp from "@/components/StickyWhatsApp";
import ScrollToTop from "@/components/ScrollToTop";
import { SettingsProvider } from "@/lib/settings";

function App() {
  return (
    <div className="App">
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/katalog" element={<CatalogPage />} />
            <Route path="/kendaraan/:id" element={<VehicleDetailPage />} />
            <Route path="/gadai-bpkb" element={<GadaiBpkbPage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <StickyWhatsApp />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </SettingsProvider>
    </div>
  );
}

export default App;
