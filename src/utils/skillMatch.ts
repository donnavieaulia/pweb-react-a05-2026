// =====================================================================
// src/utils/skillMatch.ts  —  PJ: Dona
// Fungsi murni untuk hitung Skill Match %.
// Rumus: Math.round((jumlahCocok / totalRequired) * 100), case-insensitive.
// Contoh: skill [React, TypeScript, CSS] vs lowongan [React, TypeScript, CSS, Docker]
//         -> score 75, missing ["Docker"]
// =====================================================================
import type { SkillMatchResult } from "../types";

export function calculateSkillMatch(
  _kaptenSkills: string[],
  _requiredSkills: string[],
): SkillMatchResult {
  // TODO (Dona): implementasi rumus di atas
  return { score: 0, matched: [], missing: [] };
}
