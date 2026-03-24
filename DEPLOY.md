# Deployment Guide - The Citadel: Crown & Counsel

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com (use GitHub login)
2. **Supabase Project** - Already set up with credentials
3. **Git Repository** - Push code to GitHub

---

## Step 1: Setup Supabase (Database)

### 1.1 Run SQL Migration

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Copy contents from `supabase/migrations/002_add_auth_and_assets.sql`
6. Click **"Run"**

### 1.2 Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Name: `game-assets`
4. Check **"Public bucket"** ✅
5. Click **"Create bucket"**

### 1.3 Set Storage Policies

1. Click on `game-assets` bucket
2. Go to **Policies** tab
3. Add these policies:

```sql
-- Allow public read
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets');

-- Allow developer write
CREATE POLICY "Developer Write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'game-assets' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'developer'
    )
  );

-- Allow developer delete
CREATE POLICY "Developer Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'game-assets' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'developer'
    )
  );
```

---

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with auth and AI asset generation"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/the-citadel-game.git

# Push
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub
4. Select your repository

### 3.2 Configure Project

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Environment Variables

Add these in Vercel dashboard:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://kdclnuztnvdawjcbefub.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkY2xudXp0bnZkYXdqY2JlZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjg5NTgsImV4cCI6MjA4OTc0NDk1OH0.BlhgeI6ipt_nRbH2HM0JTvkn2vossDmZEPySFGyduBM` |

### 3.4 Deploy

Click **"Deploy"** and wait for build to complete.

---

## Step 4: First Login (Developer Setup)

1. Open deployed URL
2. Click **"Sign Up"**
3. Use email: `dickoifenta27@gmail.com`
4. Create password: `@Maxfaster7137951`
5. Verify email (check inbox)
6. Login with credentials

**Note:** The trigger will automatically set your role to `developer`.

---

## Features Available

### For Developer (dickoifenta27@gmail.com)
- ✅ All game menus (Citadel, Parliament, etc.)
- ✅ **Architect Menu** with:
  - World Config (Scenarios, Events, Regions)
  - Laws & Tech
  - Factions
  - Infrastructure
  - Economy
  - **AI Asset Generator** (NEW)
  - **Asset Manager** (NEW)

### For Other Users
- ✅ All game menus
- ❌ No Architect Menu access

---

## AI Asset Generation Limits

| Limit | Value |
|-------|-------|
| Daily | 50 generations |
| Monthly | 500 generations |
| Reset | Daily at midnight UTC |

---

## Troubleshooting

### Issue: "Failed to fetch assets"
**Solution:** Check Supabase Storage bucket `game-assets` exists and is public

### Issue: "Cannot access Architect menu"
**Solution:** Verify user role is `developer` in `user_profiles` table

### Issue: "AI generation failed"
**Solution:** Check usage limits in `ai_usage_counter` table

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## Support

For issues, check:
1. Browser console for errors
2. Supabase logs in Dashboard
3. Vercel deployment logs
