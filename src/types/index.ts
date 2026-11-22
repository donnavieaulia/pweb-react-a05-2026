// =====================================================================
// src/types/index.ts  —  PJ: Dona
// "Kamus" tipe data bersama. Semua anggota import dari sini:
//   import type { Application, JobListing } from "../types";
// =====================================================================

/** Status lamaran (lihat Diagram State Machine di soal). */
export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export const WORK_MODES: readonly WorkMode[] = ["Remote", "Hybrid", "Onsite"];

/** Item checklist persiapan di dalam 1 lamaran. */
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/** Riwayat aktivitas (pembuatan lamaran, pindah status, catatan manual). */
export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  message: string;
}

/** Objek utama yang disimpan di state & localStorage. */
export interface Application {
  id: string; // crypto.randomUUID()
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string; // wajib saat pindah ke APPLIED
  appliedDate?: string; // wajib saat pindah ke APPLIED (YYYY-MM-DD)
  interviewDateTime?: string; // wajib saat INTERVIEW (YYYY-MM-DDTHH:mm)
  salaryOffer?: number; // wajib > 0 saat OFFER (Rp)
  lastUpdatedAt: string; // ISO, dasar hitung Rawan Ghosting
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}

/** 1 item lowongan dari Remotive API / magang-fallback.json. */
export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
}

/** Bentuk response Remotive API (fallback lokal memakai format yang sama). */
export interface JobApiResponse {
  jobs: JobListing[];
}

/** Sumber data lowongan (toggle di Profil Kapten). */
export type JobSource = "remote" | "local";

/** Hasil perhitungan Skill Match (derived). */
export interface SkillMatchResult {
  score: number; // 0–100
  matched: string[];
  missing: string[];
}

/** Tab navigasi utama. */
export type TabKey = "explore" | "pipeline" | "offer";
