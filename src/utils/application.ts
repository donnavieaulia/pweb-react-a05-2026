// =====================================================================
// src/utils/application.ts  —  PJ: Dona
// Helper lamaran yang dipakai Fitur 1 (Simpan ke Wishlist) & Fitur 2 (Form Manual):
// anti-duplikat, parsing skill, deteksi mode kerja, dan pembuat objek Application.
// =====================================================================
import type { Application, ApplicationStatus, WorkMode } from "../types";
import { normalizeSkill } from "./skillMatch";

/** Pasangan company + role sudah pernah dilamar? (huruf besar/kecil diabaikan) */
export function isDuplicateApplication(
  applications: Application[],
  company: string,
  role: string,
): boolean {
  const targetCompany = company.trim().toLowerCase();
  const targetRole = role.trim().toLowerCase();

  return applications.some(
    (app) =>
      app.company.trim().toLowerCase() === targetCompany &&
      app.role.trim().toLowerCase() === targetRole,
  );
}

/** "React, typescript , ,CSS" -> ["React", "typescript", "CSS"] (tanpa kosong & duplikat) */
export function parseSkills(text: string): string[] {
  const result: string[] = [];
  for (const raw of text.split(",")) {
    const skill = raw.trim();
    const alreadyAdded = result.some(
      (s) => normalizeSkill(s) === normalizeSkill(skill),
    );
    if (skill !== "" && !alreadyAdded) {
      result.push(skill);
    }
  }
  return result;
}

/** Tebak mode kerja dari teks lokasi lowongan, misal "Surabaya (Hybrid)". */
export function detectWorkMode(location: string): WorkMode {
  const text = location.toLowerCase();
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("onsite") || text.includes("on-site")) return "Onsite";
  return "Remote";
}

export interface NewApplicationInput {
  company: string;
  role: string;
  workMode: WorkMode;
  status: Extract<ApplicationStatus, "WISHLIST" | "APPLIED">;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;
  logMessage: string;
}

/** Bikin objek Application baru lengkap dengan id, waktu, dan activity log pertama. */
export function createApplication(input: NewApplicationInput): Application {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    company: input.company.trim(),
    role: input.role.trim(),
    workMode: input.workMode,
    status: input.status,
    requiredSkills: input.requiredSkills,
    cvVersion: input.cvVersion,
    appliedDate: input.appliedDate,
    lastUpdatedAt: now,
    checklist: [],
    activityLogs: [
      { id: crypto.randomUUID(), timestamp: now, message: input.logMessage },
    ],
  };
}
