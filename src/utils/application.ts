import type { Application, ApplicationStatus, WorkMode } from "../types";
import { normalizeSkill } from "./skillMatch";

// Cek duplikat perusahaan + posisi, tanpa membedakan huruf besar/kecil.
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

// Ubah input skill yang dipisahkan koma menjadi array tanpa duplikat.
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

// Tentukan mode kerja berdasarkan teks lokasi lowongan.
export function detectWorkMode(location: string): WorkMode {
  const text = location.toLowerCase();

  if (text.includes("hybrid")) return "Hybrid";

  if (text.includes("onsite") || text.includes("on-site")) {
    return "Onsite";
  }

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

// Buat lamaran baru beserta activity log pertama.
export function createApplication(
  input: NewApplicationInput,
): Application {
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
      {
        id: crypto.randomUUID(),
        timestamp: now,
        message: input.logMessage,
      },
    ],
  };
}