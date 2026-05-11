# PRD — Ritri Auto Solution

## Original Problem Statement
Website for **Ritri Auto Solution** — automotive marketplace & fintech broker/consultant operating in Balikpapan & Handil, Kalimantan Timur. Premium "Luxury & Trustworthy" aesthetic (Navy Blue + Gold + Clean White). Bahasa Indonesia. Goal: convert Meta Ads traffic into WhatsApp leads. Indonesia mobile-first.

## User Personas
- **Calon pembeli kendaraan bekas** (mobil keluarga / motor matic) di Balikpapan & Handil
- **Penjual / tukar tambah** yang ingin lepas kendaraan dengan harga kompetitif
- **Pemilik BPKB** yang butuh dana tunai cepat dengan kendaraan tetap dipakai
- **Admin Ritri Auto** untuk mengelola katalog & follow-up leads

## Core Requirements (Static)
- Brand: Navy `#0A192F` + Gold `#D4AF37` + White; Cabinet Grotesk display + Satoshi body
- Multi-page: Home, Katalog, Detail Kendaraan, Gadai BPKB (with simulator), Kontak, Admin Login, Admin Dashboard
- Mobile-first, fast loading
- Sticky WhatsApp CTA on every public page
- Form lead capture (beli / jual / gadai / kontak) saved to MongoDB
- Admin panel: CRUD katalog + leads viewer
- WhatsApp number placeholder (`6281234567890`) — to be replaced by client

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Endpoints prefixed `/api`
  - Public: `GET /vehicles`, `GET /vehicles/{id}`, `POST /leads`
  - Admin (Bearer token): login/logout/me, `/admin/stats`, CRUD `/vehicles`, list/delete `/leads`
  - In-memory session token store, 12h TTL
  - Auto-seed 8 vehicles on startup if collection empty
- **Frontend**: React 19 + react-router-dom 7 + Tailwind + shadcn/ui + sonner toasts
  - Pages under `src/pages/`, components under `src/components/`
  - Axios instance with auto Bearer token from `localStorage.ritri_admin_token`

## What's Been Implemented (2025-12)
- ✅ Backend: all endpoints, auth, seed data, MongoDB models (no _id leak)
- ✅ Frontend Home: hero, brand marquee, 3 services bento, featured grid, trust builder, CTA band
- ✅ Catalog page with category filter, search, sort
- ✅ Vehicle detail page with gallery, specs, WA CTA, lead dialog
- ✅ Gadai BPKB page with live calculator (3 sliders), lead-form, info sections
- ✅ Contact page with multi-channel info + form
- ✅ Admin login + dashboard (stats, vehicles table CRUD via dialog, leads table)
- ✅ Sticky WhatsApp button (global)
- ✅ Indonesian copy throughout, mobile-responsive
- ✅ Testing: 100% backend pytest, 100% frontend e2e

## Backlog / Next
**P0** — Operational
- Replace WhatsApp placeholder with real number (`/app/frontend/src/lib/brand.js`)
- Replace seed photos with real owner-supplied unit photos via Admin Panel
- Upload real logo (replace `R` typography mark in Navbar/Footer)

**P1** — Growth
- Lead status workflow in admin (new → contacted → closed) + notes
- Pixel/event tracking (Meta Pixel) for ad attribution & conversions
- Email/Telegram notification to admin when a lead arrives
- WhatsApp Business API auto-reply (out of MVP scope)

**P2** — Polish
- Persistent admin sessions (Redis/DB token store) + rate-limiting on `/api/admin/login`
- Image upload to S3/Cloudinary instead of URL-only
- SEO meta tags + sitemap.xml for organic search
- Indonesian schema.org for vehicle listings (rich snippets)

## Admin Credentials (test)
See `/app/memory/test_credentials.md`.
