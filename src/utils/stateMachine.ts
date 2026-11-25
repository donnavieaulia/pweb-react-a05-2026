import type {
  Application,
  ApplicationStatus,
  WorkMode,
} from "../types";

import { WORK_MODES } from "../types";

// Aturan perpindahan status mengikuti kerangka proyek.
// OFFER dan REJECTED adalah status final.
export const ALLOWED_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ["SCREENING"],
};

// Ambil daftar status tujuan yang sah.
export function getNextStatuses(
  current: ApplicationStatus,
): readonly ApplicationStatus[] {
  return ALLOWED_TRANSITIONS[current];
}

// Periksa apakah perpindahan status diperbolehkan.
export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return getNextStatuses(from).includes(to);
}

export interface TransitionFields {
  cvVersion?: string;
  appliedDate?: string;
  interviewDateTime?: string;
  salaryOffer?: number;
  workMode?: WorkMode;
}

// Return null jika valid, atau pesan error jika tidak valid.
export function validateTransition(
  app: Application,
  to: ApplicationStatus,
  fields: TransitionFields,
): string | null {
  if (!canTransition(app.status, to)) {
    return "Perpindahan status tidak diizinkan.";
  }

  if (
    to === "APPLIED" &&
    (!fields.cvVersion?.trim() ||
      !fields.appliedDate ||
      !Number.isFinite(Date.parse(fields.appliedDate)))
  ) {
    return "Isi versi CV dan tanggal melamar yang valid.";
  }

  if (
    to === "INTERVIEW" &&
    (!fields.interviewDateTime ||
      !Number.isFinite(Date.parse(fields.interviewDateTime)))
  ) {
    return "Isi jadwal interview yang valid.";
  }

  if (
    to === "OFFER" &&
    (!Number.isFinite(fields.salaryOffer) ||
      (fields.salaryOffer ?? 0) <= 0 ||
      !fields.workMode ||
      !WORK_MODES.includes(fields.workMode))
  ) {
    return "Gaji offer harus lebih dari 0 dan mode kerja wajib dipilih.";
  }

  return null;
}

// Update immutable: objek lamaran lama tidak dimutasi.
// ID dan timestamp dibuat di event handler agar aman di StrictMode.
export function transitionApplication(
  app: Application,
  to: ApplicationStatus,
  fields: TransitionFields,
  now: string,
  logId: string,
): Application {
  if (validateTransition(app, to, fields)) {
    return app;
  }

  const patch: TransitionFields =
    to === "APPLIED"
      ? {
          cvVersion: fields.cvVersion?.trim(),
          appliedDate: fields.appliedDate,
        }
      : to === "INTERVIEW"
        ? {
            interviewDateTime: fields.interviewDateTime,
          }
        : to === "OFFER"
          ? {
              salaryOffer: fields.salaryOffer,
              workMode: fields.workMode,
            }
          : {};

  return {
    ...app,
    ...patch,
    status: to,
    lastUpdatedAt: now,
    activityLogs: [
      {
        id: logId,
        timestamp: now,
        message: `Status ${app.status} → ${to}`,
      },
      ...app.activityLogs,
    ],
  };
}