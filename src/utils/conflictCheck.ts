// =====================================================================
// src/utils/conflictCheck.ts  —  PJ: Sean
// 1) Rawan Ghosting: status APPLIED/SCREENING tidak berubah > 14 hari.
// 2) Bentrok interview: >= 2 lamaran INTERVIEW berselisih < 60 menit.
//    Cek dari SELURUH data, bukan data yang ter-filter.
// =====================================================================
import type { Application } from "../types";

export const GHOSTING_DAYS = 14;
export const CONFLICT_MINUTES = 60;

export function isRawanGhosting(_app: Application, _now: Date = new Date()): boolean {
  // TODO (Sean)
  return false;
}

/** Return pasangan lamaran yang bentrok. */
export function findInterviewConflicts(
  _applications: Application[],
): Array<[Application, Application]> {
  // TODO (Sean)
  return [];
}
