// =====================================================================
// src/utils/offerScore.ts  —  PJ: Rifki
// Total = (Normalisasi Gaji x 50%) + (Skor Mode Kerja x 25%) + (Skill Match % x 25%)
// Skor Mode: Remote 100, Hybrid 75, Onsite 50.
// Normalisasi gaji (sesuai wireframe): gaji / gajiTertinggi * 100
// =====================================================================
import type { Application, WorkMode } from "../types";

export const WORK_MODE_SCORE: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export interface OfferScore {
  salaryPoints: number; // max 50
  modePoints: number; // max 25
  skillPoints: number; // max 25
  total: number; // max 100
}

export function calculateOfferScore(
  _offer: Application,
  _maxSalary: number,
  _skillMatchPercent: number,
): OfferScore {
  // TODO (Rifki)
  return { salaryPoints: 0, modePoints: 0, skillPoints: 0, total: 0 };
}
