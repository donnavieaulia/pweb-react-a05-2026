import type { Application } from "../types";
import { isRawanGhosting } from "./conflictCheck";

// Statistik dihitung langsung dari data lamaran.
// Persentase menggunakan status saat ini, bukan riwayat status.
export function calculateDashboardStats(
  applications: Application[],
  now = new Date(),
) {
  const submitted = applications.filter(
    (app) => app.status !== "WISHLIST",
  ).length;

  const responses = applications.filter((app) =>
    ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"].includes(app.status),
  ).length;

  const interviews = applications.filter((app) =>
    ["INTERVIEW", "OFFER"].includes(app.status),
  ).length;

  return {
    total: applications.length,

    responseRate: submitted
      ? Math.round((responses / submitted) * 100)
      : 0,

    interviewRate: submitted
      ? Math.round((interviews / submitted) * 100)
      : 0,

    ghosting: applications.filter((app) =>
      isRawanGhosting(app, now),
    ).length,

    offers: applications.filter(
      (app) => app.status === "OFFER",
    ).length,
  };
}