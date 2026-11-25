// =====================================================================
// src/utils/conflictCheck.ts  —  PJ: Sean
// 1) Rawan Ghosting: status APPLIED/SCREENING tidak berubah > 14 hari.
// 2) Bentrok interview: >= 2 lamaran INTERVIEW berselisih < 60 menit.
//    Cek dari SELURUH data, bukan data yang ter-filter.
// =====================================================================
import type { Application } from "../types";

export const GHOSTING_DAYS = 14;
export const CONFLICT_MINUTES = 60;

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_DAY = MS_PER_MINUTE * 60 * 24;

export function isRawanGhosting(app: Application, now: Date = new Date()): boolean {
  if (app.status !== "APPLIED" && app.status !== "SCREENING") return false;

  const updatedMs = Date.parse(app.lastUpdatedAt);
  if (Number.isNaN(updatedMs)) return false;

  const diffDays = (now.getTime() - updatedMs) / MS_PER_DAY;
  return diffDays > GHOSTING_DAYS;
}

/** Return pasangan lamaran yang bentrok. */
export function findInterviewConflicts(
  applications: Application[],
): Array<[Application, Application]> {
  const interviews = applications
    .filter(
      (app): app is Application & { interviewDateTime: string } =>
        app.status === "INTERVIEW" &&
        typeof app.interviewDateTime === "string" &&
        app.interviewDateTime !== "" &&
        !Number.isNaN(Date.parse(app.interviewDateTime)),
    )
    .map((app) => ({
      app,
      timeMs: Date.parse(app.interviewDateTime),
    }));

  const conflicts: Array<[Application, Application]> = [];

  for (let i = 0; i < interviews.length; i++) {
    for (let j = i + 1; j < interviews.length; j++) {
      const diffMinutes =
        Math.abs(interviews[i].timeMs - interviews[j].timeMs) / MS_PER_MINUTE;
      if (diffMinutes < CONFLICT_MINUTES) {
        conflicts.push([interviews[i].app, interviews[j].app]);
      }
    }
  }

  return conflicts;
}
 