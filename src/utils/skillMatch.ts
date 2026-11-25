import type { SkillMatchResult } from "../types";

// Samakan format skill agar perbandingan case-insensitive.
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function calculateSkillMatch(
  kaptenSkills: string[],
  requiredSkills: string[],
): SkillMatchResult {
  // Hindari pembagian dengan nol.
  if (requiredSkills.length === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
    };
  }

  const owned = new Set(kaptenSkills.map(normalizeSkill));

  const matched = requiredSkills.filter((skill) =>
    owned.has(normalizeSkill(skill)),
  );

  const missing = requiredSkills.filter(
    (skill) => !owned.has(normalizeSkill(skill)),
  );

  const score = Math.round(
    (matched.length / requiredSkills.length) * 100,
  );

  return {
    score,
    matched,
    missing,
  };
}

export type MatchLevel = "ok" | "warn" | "bad";

// Hijau >= 70%, kuning 40–69%, merah < 40%.
export function getMatchLevel(score: number): MatchLevel {
  if (score >= 70) return "ok";
  if (score >= 40) return "warn";

  return "bad";
}