# Library Apps — Landing Page (React + TS + Supabase)

Landing page 1 halaman, ringan + minimalis, layout mengikuti referensi (hero + stats + fitur + preview screenshot + rating + CTA + footer).

## 1) Jalankan di lokal

```bash
npm install
cp .env.example .env
# isi env Supabase
npm run dev
```

## 2) Supabase Setup (WAJIB untuk rating & download counter)

### A. Buat Project + Auth Google
1. Supabase Dashboard   **Authentication**   **Providers**   aktifkan **Google**.
2. Isi **Client ID** & **Client Secret** dari Google Cloud Console.
3. Tambahkan Redirect URL:
   - Lokal: `http://localhost:5173`
   - Vercel: `https://DOMAIN-VERCEL-ANDA.vercel.app`

> Pastikan **Site URL** di Supabase juga sesuai domain deploy.

### B. Buat tabel + policy (SQL)
Jalankan file: `supabase/schema.sql`

## 3) Deploy ke Vercel
- Import repo GitHub
- Set Environment Variables di Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - (opsional) `VITE_DOWNLOAD_URL`

## 4) Ganti asset / file download
- Screenshot aplikasi ada di: `public/screens/*`
- Logo ada di: `public/brand/logo.png`
- File download default: `public/download/library_app_demo.zip`
  - Ganti dengan file asli Anda (nama sama), atau set `VITE_DOWNLOAD_URL` ke link lain (contoh GitHub Releases).

> Catatan: file statis yang terlalu besar bisa bikin deploy Vercel berat. Kalau APK/ZIP Anda besar, rekomendasi paling aman: taruh di **GitHub Releases** lalu pakai `VITE_DOWNLOAD_URL`.

## Struktur utama
- `src/sections/*` : tiap section (Hero, Stats, Fitur, Screenshot, Rating, CTA, Footer)
- `src/lib/supabase.ts` : client Supabase + helper query

## Lisensi
Bebas dipakai & dimodifikasi untuk kebutuhan project Anda.
