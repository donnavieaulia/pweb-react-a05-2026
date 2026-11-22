# Aku Mw Magang — Praktikum Pemweb Modul 5 (Kelompok A05)

Aplikasi frontend React untuk membantu Kapten mengelola lamaran magang: eksplorasi lowongan + Skill Match, War Room pipeline lamaran, dan Offer Comparator.

**Stack:** React 19 + TypeScript (`strict: true`, tanpa `any`) + Vite (template `react-ts`), CSS murni.
Tanpa library state management / form eksternal, semuanya pakai React Hooks bawaan + Custom Hooks.

## Cara Menjalankan

```bash
npm install
npm run dev          # http://localhost:5173
npx tsc --noEmit -p tsconfig.app.json   # cek tipe
npm run build        # cek build
```

## Pembagian Tugas

| Nama  | Tugas Utama | Custom Hooks & Utils | Fokus Demo |
|-------|-------------|----------------------|------------|
| Dona  | Setup proyek, Navigasi, Fitur 1 (Profil Skill & Eksplorasi), Fitur 2 (Form Manual) | `useDebounce<T>`, `jobService.ts`, `skillMatch.ts`, `src/types/` | `fetch` + `AbortController`, `useDebounce` 400ms, `useRef` auto-focus |
| Sean  | Persistensi Storage, Fitur 3 (War Room, Ghosting, Bentrok), Fitur 6 (Undo Delete), Fitur Bonus | `useLocalStorage<T>`, `conflictCheck.ts` | Generics `useLocalStorage`, `useRef` + `clearTimeout`, deteksi bentrok/ghosting |
| Rifki | Fitur 4 (Detail & State Machine), Fitur 5 (Interview Timer), Fitur 7 (Statistik & Offer Comparator) | `stateMachine.ts`, `offerScore.ts` | `useEffect` cleanup `clearInterval`, nested immutability, rumus Offer Comparator |

## Struktur Folder

```
public/
└── magang-fallback.json        # 15 lowongan fallback (format Remotive)
src/
├── types/index.ts              # Dona   — tipe data bersama
├── hooks/
│   ├── useDebounce.ts          # Dona
│   └── useLocalStorage.ts      # Sean
├── services/jobService.ts      # Dona
├── utils/
│   ├── skillMatch.ts           # Dona
│   ├── conflictCheck.ts        # Sean
│   ├── stateMachine.ts         # Rifki
│   └── offerScore.ts           # Rifki
├── components/
│   ├── layout/Navbar.tsx       # Dona
│   ├── explore/                # Dona  — SkillProfile, JobExplorer, JobCard
│   ├── form/                   # Dona  — ApplicationForm
│   ├── pipeline/               # Sean  — WarRoom, ConflictBanner, UndoToast
│   ├── detail/                 # Rifki — ApplicationDetail, InterviewTimer
│   └── dashboard/              # Rifki — StatsCards, OfferComparator
└── App.tsx                     # Dona  — state utama + navigasi
```

Setiap file punya header `PJ: <nama>` dan komentar `TODO`. Komponen yang belum dikerjakan masih tampil sebagai kotak placeholder.

## Aturan Kerja Kelompok

1. Selalu `git pull` sebelum mulai ngoding.
2. Kerjakan di branch sendiri (`dona`, `sean`, `rifki`), lalu buat Pull Request ke `main`.
3. Sebelum push, pastikan `npx tsc --noEmit -p tsconfig.app.json` dan `npm run build` lolos.
4. Kalau mau mengubah `src/types/`, kabari grup dulu, karena file itu dipakai semua anggota.

## Catatan

- `ALLOWED_TRANSITIONS` di `stateMachine.ts` masih asumsi (diagram State Machine tidak ada di PDF soal). Cocokkan dengan diagram resmi dari asisten.
- `public/magang-fallback.json` berisi data dummy. Ganti dengan file resmi kalau asisten membagikannya.
