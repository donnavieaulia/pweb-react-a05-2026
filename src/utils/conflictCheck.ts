import type { Application } from "../types";

export const GHOSTING_DAYS = 14;
export const CONFLICT_MINUTES = 60;

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_DAY = MS_PER_MINUTE * 60 * 24;

// Rawan ghosting jika APPLIED/SCREENING tidak berubah lebih dari 14 hari.
export function isRawanGhosting(
  app: Application,
  now: Date = new Date(),
): boolean {
  if (app.status !== "APPLIED" && app.status !== "SCREENING") {
    return false;
  }

  const updatedMs = Date.parse(app.lastUpdatedAt);

  if (Number.isNaN(updatedMs)) return false;

  const diffDays = (now.getTime() - updatedMs) / MS_PER_DAY;

  return diffDays > GHOSTING_DAYS;
}

// Mengembalikan pasangan lamaran dengan jadwal interview bentrok.
// Panggil menggunakan seluruh data applications, bukan hasil filter.
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
        Math.abs(interviews[i].timeMs - interviews[j].timeMs) /
        MS_PER_MINUTE;

      if (diffMinutes < CONFLICT_MINUTES) {
        conflicts.push([interviews[i].app, interviews[j].app]);
      }
    }
  }

  return conflicts;
}