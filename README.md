# The Citadel: Crown & Counsel

## Setup Awal

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (copy dan isi dengan Supabase key)
cp .env.example .env

# 3. Jalankan development server
npm run dev
```

## Database Setup

1. Jalankan `supabase/schema.sql` di Supabase SQL Editor
2. Jalankan `scripts/seed_data.sql` untuk mengisi data

## Dev Mode

Aplikasi berjalan dalam **dev mode** (tanpa autentikasi) untuk memudahkan testing.

Untuk enable auth, ubah `DEV_MODE = false` di `src/lib/AuthContext.jsx`
