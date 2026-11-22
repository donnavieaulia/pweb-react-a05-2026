// =====================================================================
// src/utils/skillMatch.ts  —  PJ: Dona
// Fungsi murni untuk hitung Skill Match %.
// Rumus: Math.round((jumlahCocok / totalRequired) * 100), case-insensitive.
// Contoh: skill [React, TypeScript, CSS] vs lowongan [React, TypeScript, CSS, Docker]
//         -> score 75, missing ["Docker"]
// =====================================================================
import type { SkillMatchResult } from "../types";

/** Samakan format skill: buang spasi di pinggir + huruf kecil semua. */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function calculateSkillMatch(
  kaptenSkills: string[],
  requiredSkills: string[],
): SkillMatchResult {
  // Lowongan tanpa skill -> hindari pembagian dengan 0
  if (requiredSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  // Set = "daftar hadir" skill Kapten, versi huruf kecil
  const owned = new Set(kaptenSkills.map(normalizeSkill));

  const matched = requiredSkills.filter((skill) =>
    owned.has(normalizeSkill(skill)),
  );
  const missing = requiredSkills.filter(
    (skill) => !owned.has(normalizeSkill(skill)),
  );

  const score = Math.round((matched.length / requiredSkills.length) * 100);

  return { score, matched, missing };
}

/** Level warna badge: hijau >= 70, kuning 40–69, merah < 40. */
export type MatchLevel = "ok" | "warn" | "bad";

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 70) return "ok";
  if (score >= 40) return "warn";
  return "bad";
}
