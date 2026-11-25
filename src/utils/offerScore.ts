import type { Application, WorkMode } from "../types";

export const WORK_MODE_SCORE: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export interface OfferScore {
  salaryPoints: number;
  modePoints: number;
  skillPoints: number;
  total: number;
}

// Bobot: gaji 50%, mode kerja 25%, skill match 25%.
// maxSalary adalah gaji tertinggi dari dua offer yang dibandingkan.
export function calculateOfferScore(
  offer: Application,
  maxSalary: number,
  skillMatchPercent: number,
): OfferScore {
  const salary = Math.max(0, offer.salaryOffer ?? 0);

  const salaryPoints =
    maxSalary > 0
      ? Math.min(salary / maxSalary, 1) * 50
      : 0;

  const modePoints = WORK_MODE_SCORE[offer.workMode] * 0.25;

  const skillPoints =
    Math.min(100, Math.max(0, skillMatchPercent)) * 0.25;

  return {
    salaryPoints,
    modePoints,
    skillPoints,
    total: salaryPoints + modePoints + skillPoints,
  };
}