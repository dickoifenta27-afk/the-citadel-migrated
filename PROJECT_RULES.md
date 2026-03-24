# PROJECT RULES - The Citadel: Crown & Counsel

> **DOKUMEN INI ADALAH SINGLE SOURCE OF TRUTH**  
> Semua keputusan, preferensi, dan aturan kerja tercatat di sini.

---

## 🎯 PRINSIP DASAR

### 1. ZERO MODIFICATION WITHOUT PERMISSION
```
❌ DILARANG: Mengubah kode/UI/database tanpa izin eksplisit
✅ WAJIB: Tanya dulu "Boleh saya ubah X?" atau "Ada 3 opsi: A, B, C"
```

### 2. USER HAS FINAL SAY
```
❌ DILARANG: Saya memutuskan sendiri
✅ WAJIB: User yang punya hak veto dan keputusan final
```

### 3. CHECKPOINT SYSTEM
```
- Setiap milestone harus di-save sebagai checkpoint
- Bisa revert ke checkpoint sebelumnya
- Track: file yang diubah, alasan perubahan, timestamp
```

### 4. RECOMMEND BEST OPTION
```
Jika ada beberapa opsi pilihan:
✅ WAJIB: Sampaikan opsi terbaik menurut saya dengan alasannya
✅ WAJIB: Berikan pro/con untuk setiap opsi
✅ WAJIB: User tetap punya hak veto final
```

### 5. SINGLE SOLUTION = NO CONFIRMATION
```
Jika hanya ADA SATU CARA untuk solving:
✅ BOLEH: Langsung eksekusi tanpa konfirmasi
✅ WAJIB: Laporkan apa yang sudah dilakukan setelah eksekusi
```

### 6. RIPPLE EFFECT = MUST CONSULT
```
Jika satu-satunya cara solving dapat menyebabkan issue lain:
❌ DILARANG: Langsung eksekusi
✅ WAJIB: Konsultasikan dulu ke user
✅ WAJIB: Jelaskan potensi ripple effect-nya
```

---

## 🗃️ DATABASE RULES

### Struktur Harus IDENTIK dengan Base44
| Aspek | Rule |
|-------|------|
| **Nama tabel** | Harus sama persis dengan Excel/Base44 |
| **Nama kolom** | Harus sama persis, case-sensitive |
| **Tipe data** | Sama dengan Base44, tidak ada constraint tambahan |
| **Constraint** | Hanya PRIMARY KEY, FOREIGN KEY, UNIQUE - NO CHECK constraints |
| **Default values** | Sama dengan Base44 |
| **ID** | UUID auto-generate dari Supabase |

### Kolom Khusus
| Kolom | Perlakuan |
|-------|-----------|
| `intensity` | Boleh nilai besar (50, 100, dll) - NO CHECK constraint |
| `pp_cost` | DECIMAL, boleh NULL |
| `order` | Harus di-quote dengan `"order"` |
| JSONB columns | Selalu cast dengan `::jsonb` |

### Seed Data
- Data dari Excel di-insert APA ADANYA
- Tidak ada modifikasi nilai
- Jika error, tanya user dulu jangan langsung ubah

---

## 🎨 UI/UX RULES

### Tidak Boleh Diubah Tanpa Izin
- Warna tema (gold: #C9A84C, dark bg: #0A0A0F)
- Font (Cinzel, Cinzel Decorative)
- Layout dan struktur komponen
- CSS styling
- Animations dan effects

### Copy-Paste Policy
```
File dari repo GitHub harus di-copy AS-IS kecuali:
1. Import path yang perlu diubah
2. Environment variables
3. SDK adapter (base44 → Supabase)
```

---

## 📝 WORKFLOW RULES

### Sebelum Eksekusi
```
WAJIB tanya salah satu:
1. "Boleh saya eksekusi [task]?"
2. "Ada 3 opsi untuk solve ini: A, B, C - mana yang Anda prefer?"
3. "Ini akan mengubah [file] - oke?"
```

### Saat Eksekusi
```
1. Buat todo list terlebih dahulu
2. Update todo status (in_progress/completed)
3. Track file yang diubah
4. Verifikasi setelah eksekusi
```

### Setelah Eksekusi
```
1. Report: file apa saja yang diubah
2. Report: error apa yang muncul (jika ada)
3. Report: langkah selanjutnya
```

---

## 🚨 ERROR HANDLING RULES

### Jangan Langsung Fix!
```
❌ SALAH:
User: Ada error
Saya: Langsung ubah 10 file

✅ BENAR:
User: Ada error
Saya: 
1. Analisis error
2. Beri 2-3 opsi solusi dengan pro/con
3. Tanya: "Mana yang Anda prefer?"
4. Eksekusi setelah approval
```

### Error Categories
| Error | Action |
|-------|--------|
| Database constraint | Tanya user: ubah schema atau ubah data? |
| Missing table | Tanya user: buat table atau skip? |
| Import error | Tanya user: install package atau cari alternatif? |
| Runtime error | Tanya user: debug atau revert ke checkpoint? |

---

## 📋 DECISION LOG

| Tanggal | Keputusan | Status |
|---------|-----------|--------|
| 2026-03-23 | Database harus IDENTIK dengan Base44, no improvements | FINAL |
| 2026-03-23 | UI/UX tidak boleh diubah tanpa izin | FINAL |
| 2026-03-23 | Tanya dulu sebelum eksekusi apapun | FINAL |
| 2026-03-23 | User punya hak veto dan keputusan final | FINAL |

---

## 🔄 CHECKPOINT HISTORY

| Checkpoint | Deskripsi | File yang Diubah |
|------------|-----------|------------------|
| v0.1 | Initial clone dari GitHub | All files |
| v0.2 | Schema.sql dengan 23 tabel | supabase/schema.sql |
| v0.3 | Seed data dari Excel | scripts/seed_data.sql |
| v0.4 | Fix DECIMAL precision | supabase/schema.sql |
| v0.5 | Tambah tabel users | supabase/schema.sql |
| v0.6 | SDK compatible Base44 | src/lib/custom-sdk.js |

---

## ⚙️ TECH STACK (Final)

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth |
| State | React Query (TanStack Query) |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |

---

## 📞 KOMUNIKASI

### Format Laporan
```
✅ [TASK] - [STATUS]
📁 File: [list file]
📝 Note: [catatan penting]
❓ Next: [langkah selanjutnya / butuh approval]
```

### Format Minta Approval
```
🤔 BUTUH APPROVAL
Opsi A: [deskripsi] - Pro: X, Con: Y
Opsi B: [deskripsi] - Pro: X, Con: Y
Opsi C: [deskripsi] - Pro: X, Con: Y

Mana yang Anda pilih? Atau ada opsi lain?
```

---

## ✅ VERIFICATION CHECKLIST

Sebelum bilang "selesai", verifikasi:
- [ ] Semua file yang diubah sudah di-list
- [ ] Tidak ada file yang terlewat
- [ ] User sudah approve (jika ada perubahan)
- [ ] Todo list sudah di-update
- [ ] Checkpoint sudah di-save (jika milestone)

---

**Last Updated:** 2026-03-23  
**Author:** Dicko Ifenta (Project Owner)  
**Maintainer:** AI Assistant (Kimi)
