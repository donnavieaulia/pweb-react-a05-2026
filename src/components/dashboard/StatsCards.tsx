import type { Application } from "../../types";
import { calculateDashboardStats } from "../../utils/dashboardStats";
import "./dashboard.css";
export default function StatsCards({
  applications,
}: {
  applications: Application[];
}) {
  const stats = calculateDashboardStats(applications);
  const cards = [
    ["Total Lamaran", stats.total, "Termasuk Wishlist"],
    [
      "Response Rate",
      `${stats.responseRate}%`,
      "(Screening + Interview + Offer + Rejected) / non-Wishlist",
    ],
    [
      "Interview Rate",
      `${stats.interviewRate}%`,
      "(Interview + Offer) / non-Wishlist",
    ],
    [
      "Rawan Ghosting",
      stats.ghosting,
      "Applied / Screening tanpa perubahan > 14 hari",
    ],
    ["Total Offer", stats.offers, "Lamaran berstatus Offer"],
  ];
  return (
    <section className="stats-grid" aria-label="Statistik lamaran">
      {cards.map(([label, value, description]) => (
        <article className="kotak stat-card" key={label}>
          <h2 className="subsection-title">{label}</h2>
          <strong className="stat-value">{value}</strong>
          <p className="muted small">{description}</p>
        </article>
      ))}
    </section>
  );
}
