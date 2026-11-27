import type { Application, ApplicationStatus, WorkMode } from "../types";
import { APPLICATION_STATUSES, WORK_MODES } from "../types";
import { normalizeSkill } from "./skillMatch";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Cek duplikat perusahaan + posisi, tanpa membedakan huruf besar/kecil.
export function isDuplicateApplication(
  applications: Application[],
  company: string,
  role: string,
): boolean {
  const targetCompany = normalizeText(company);
  const targetRole = normalizeText(role);

  if (!targetCompany || !targetRole) return false;

  return applications.some(
    (app) =>
      typeof app?.company === "string" &&
      typeof app?.role === "string" &&
      normalizeText(app.company) === targetCompany &&
      normalizeText(app.role) === targetRole,
  );
}

/** Bersihkan data lamaran dari localStorage agar format lama/rusak tidak memicu crash. */
export function sanitizeApplications(raw: unknown): Application[] {
  if (!Array.isArray(raw)) return [];

  const result: Application[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    if (typeof record.company !== "string" || typeof record.role !== "string") {
      continue;
    }

    const workMode = WORK_MODES.includes(record.workMode as WorkMode)
      ? (record.workMode as WorkMode)
      : "Remote";
    const status = APPLICATION_STATUSES.includes(
      record.status as ApplicationStatus,
    )
      ? (record.status as ApplicationStatus)
      : "WISHLIST";

    result.push({
      id:
        typeof record.id === "string" && record.id !== ""
          ? record.id
          : crypto.randomUUID(),
      company: record.company,
      role: record.role,
      workMode,
      status,
      requiredSkills: Array.isArray(record.requiredSkills)
        ? record.requiredSkills.filter((s): s is string => typeof s === "string")
        : [],
      cvVersion:
        typeof record.cvVersion === "string" ? record.cvVersion : undefined,
      appliedDate:
        typeof record.appliedDate === "string" ? record.appliedDate : undefined,
      interviewDateTime:
        typeof record.interviewDateTime === "string"
          ? record.interviewDateTime
          : undefined,
      salaryOffer:
        typeof record.salaryOffer === "number" &&
        !Number.isNaN(record.salaryOffer)
          ? record.salaryOffer
          : undefined,
      lastUpdatedAt:
        typeof record.lastUpdatedAt === "string" && record.lastUpdatedAt !== ""
          ? record.lastUpdatedAt
          : new Date().toISOString(),
      checklist: Array.isArray(record.checklist)
        ? record.checklist.filter(
            (entry): entry is Application["checklist"][number] =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as Record<string, unknown>).id === "string" &&
              typeof (entry as Record<string, unknown>).text === "string" &&
              typeof (entry as Record<string, unknown>).done === "boolean",
          )
        : [],
      activityLogs: Array.isArray(record.activityLogs)
        ? record.activityLogs.filter(
            (entry): entry is Application["activityLogs"][number] =>
              typeof entry === "object" &&
              entry !== null &&
              typeof (entry as Record<string, unknown>).id === "string" &&
              typeof (entry as Record<string, unknown>).timestamp === "string" &&
              typeof (entry as Record<string, unknown>).message === "string",
          )
        : [],
    });
  }

  return result;
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