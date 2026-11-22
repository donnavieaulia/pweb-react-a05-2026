// =====================================================================
// src/utils/stateMachine.ts  —  PJ: Rifki
// Aturan transisi status. OFFER & REJECTED final. GHOSTED boleh ke SCREENING.
// CATATAN: cocokkan lagi dengan Diagram State Machine resmi dari asisten.
// =====================================================================
import type { ApplicationStatus } from "../types";

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ["SCREENING"],
};

export function getNextStatuses(_current: ApplicationStatus): ApplicationStatus[] {
  // TODO (Rifki): return ALLOWED_TRANSITIONS[current]
  return [];
}

export function canTransition(_from: ApplicationStatus, _to: ApplicationStatus): boolean {
  // TODO (Rifki)
  return false;
}
