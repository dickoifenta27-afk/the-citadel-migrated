# 🧠 MEMORY LOG - The Citadel: Crown & Counsel

> **File ini berisi catatan lengkap tentang setup project.**
> **Baca ini setiap kali melanjutkan pekerjaan.**

---

## 📁 STRUKTUR FOLDER YANG BENAR

```
/mnt/okcomputer/output/
├── the-citadel-crown-counsel-main/     ← ❌ JANGAN PAKAI (Base44 asli)
├── the-citadel-migrated/               ← ✅ PAKAI INI (Supabase + Auth + AI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiAssetGenerator.jsx    ← AI Image Generator
│   │   │   ├── AssetManager.jsx        ← Asset management UI
│   │   │   └── ... (components lain)
│   │   ├── lib/
│   │   │   ├── AuthContext.jsx         ← Auth system dengan role
│   │   │   └── ... (utils lain)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           ← Login/Signup page
│   │   │   ├── Architect.jsx           ← Config menu (dengan tab Assets)
│   │   │   └── ... (pages lain)
│   │   ├── config/
│   │   │   └── assets.js               ← Asset URLs config
│   │   └── api/
│   │       └── supabaseClient.js       ← Supabase connection
│   ├── supabase/
│   │   ├── migrations/
│   │   │   └── 002_add_auth_and_assets.sql  ← SQL untuk auth & assets
│   │   └── schema.sql                  ← Database schema
│   ├── public/                         ← Static assets
│   ├── package.json                    ← Dependencies
│   ├── vite.config.js                  ← Vite config (NO Base44!)
│   ├── vercel.json                     ← Vercel deployment config
│   └── .env                            ← Environment variables
│
└── citadel-assets/                     ← Assets repository (icons, buildings, dll)
```

---

## 🔑 FILE-FILE PENTING YANG SUDAH DIBUAT

### 1. Auth System
| File | Lokasi | Fungsi |
|------|--------|--------|
| `AuthContext.jsx` | `src/lib/` | Auth state, login, logout, role check |
| `LoginPage.jsx` | `src/pages/` | UI login/signup |

### 2. AI Asset Generator
| File | Lokasi | Fungsi |
|------|--------|--------|
| `AiAssetGenerator.jsx` | `src/components/` | UI generate images dengan AI |
| `AssetManager.jsx` | `src/components/` | UI manage assets yang sudah dibuat |

### 3. Database
| File | Lokasi | Fungsi |
|------|--------|--------|
| `002_add_auth_and_assets.sql` | `supabase/migrations/` | SQL untuk 3 tables baru |

### 4. Config
| File | Lokasi | Fungsi |
|------|--------|--------|
| `assets.js` | `src/config/` | URL config untuk assets |
| `vercel.json` | Root | Vercel deployment settings |
| `vite.config.js` | Root | Vite build config (NO Base44 plugin) |

---

## 🚀 CARA DEPLOY KE VERCEL

### Step 1: Push ke GitHub (dari folder the-citadel-migrated)

```bash
# Masuk ke folder yang benar
cd the-citadel-migrated

# Install dependencies (untuk local development)
npm install

# Test locally (opsional)
npm run dev

# Initialize git
git init

# Add semua file (KECUALI node_modules - sudah di .gitignore)
git add .

# Commit
git commit -m "Initial commit - The Citadel with Auth & AI Generator"

# Add remote (ganti dengan repo GitHub kamu)
git remote add origin https://github.com/dickoifenta27-afk/The-Citadel-v3.git

# Push
git push -u origin main
```

### Step 2: Setup Supabase (SEBELUM deploy ke Vercel)

1. Buka https://app.supabase.com
2. Pilih project: `kdclnuztnvdawjcbefub`
3. **SQL Editor** → **New query**
4. Copy paste isi file: `supabase/migrations/002_add_auth_and_assets.sql`
5. Click **Run**

### Step 3: Create Storage Bucket

1. Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `game-assets`
4. Check **Public bucket** ✅
5. Click **Create bucket**

### Step 4: Deploy ke Vercel

1. Buka https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import dari GitHub: `The-Citadel-v3`
4. **Framework Preset**: `Vite`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://kdclnuztnvdawjcbefub.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkY2xudXp0bnZkYXdqY2JlZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjg5NTgsImV4cCI6MjA4OTc0NDk1OH0.BlhgeI6ipt_nRbH2HM0JTvkn2vossDmZEPySFGyduBM
   ```
8. Click **Deploy**

---

## 🔑 LOGIN CREDENTIALS

| Email | Password | Role |
|-------|----------|------|
| `dickoifenta27@gmail.com` | `@Maxfaster7137951` | Developer |

**Catatan**: Saat signup dengan email ini, trigger akan otomatis set role ke `developer`.

---

## 📊 AI GENERATION LIMITS

| Limit | Value |
|-------|-------|
| Daily | 50 generations |
| Monthly | 500 generations |
| Reset | Midnight UTC |

---

## 🗄️ DATABASE TABLES

### 1. `user_profiles`
- `id` (UUID) - Primary key, references auth.users
- `email` (TEXT)
- `role` (TEXT) - 'developer' atau 'player'
- `created_at` (TIMESTAMP)

### 2. `game_assets`
- `id` (UUID) - Primary key
- `asset_name` (VARCHAR)
- `asset_type` (VARCHAR) - 'faction_icon', 'building', 'background', dll
- `storage_path` (TEXT) - Path di Supabase Storage
- `public_url` (TEXT) - CDN URL
- `prompt_used` (TEXT) - AI prompt
- `created_by` (UUID) - User yang membuat
- `is_active` (BOOLEAN)

### 3. `ai_usage_counter`
- `user_id` (UUID) - Primary key
- `daily_count` (INTEGER)
- `monthly_count` (INTEGER)
- `last_reset_date` (DATE)
- `last_reset_month` (DATE)

---

## ⚠️ CATATAN PENTING

### 1. JANGAN PAKAI FOLDER `the-citadel-crown-counsel-main`
- Itu adalah export asli dari Base44
- Sudah tidak digunakan lagi
- Yang aktif adalah `the-citadel-migrated`

### 2. Vite Config
- **TIDAK** pakai Base44 plugin lagi
- Sudah diganti dengan config sederhana
- Kalau ada error build, cek `vite.config.js`

### 3. Supabase Credentials
- URL: `https://kdclnuztnvdawjcbefub.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Jangan share credentials ini ke publik!

### 4. Node Modules
- **TIDAK** perlu push `node_modules/` ke GitHub
- Sudah ada di `.gitignore`
- Vercel akan otomatis `npm install` saat build

---

## 🔄 WORKFLOW UPDATE

### Jika ada perubahan code:
```bash
cd the-citadel-migrated

# Edit files...

# Commit changes
git add .
git commit -m "Update: [deskripsi perubahan]"
git push origin main

# Vercel akan auto-redeploy
```

### Jika perlu update database:
1. Buat file SQL baru di `supabase/migrations/`
2. Run di Supabase SQL Editor
3. Commit dan push code changes

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module '@base44/vite-plugin'"
**Solusi**: Cek `vite.config.js` - pastikan tidak import Base44 plugin

### Error: "Failed to fetch assets"
**Solusi**: Cek Supabase Storage bucket `game-assets` sudah dibuat dan public

### Error: "Cannot access Architect menu"
**Solusi**: Cek user role di `user_profiles` table - harus 'developer'

### Error: "AI generation limit reached"
**Solusi**: Tunggu sampai midnight UTC, atau cek `ai_usage_counter` table

---

## 📞 KONTAK

Developer: dickoifenta27@gmail.com

---

**Last Updated**: 2026-03-24
**Version**: 1.0.0
