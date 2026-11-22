// =====================================================================
// src/components/explore/JobCard.tsx  —  PJ: Dona
// Fitur 1 — Kartu lowongan: badge Match % (hijau >= 70, kuning 40–69, merah < 40),
// skill cocok vs missing, tombol Simpan ke Wishlist / Sudah Dilamar.
// =====================================================================
import type { JobListing, SkillMatchResult } from "../../types";
import { getMatchLevel } from "../../utils/skillMatch";

interface JobCardProps {
  job: JobListing;
  match: SkillMatchResult;
  isApplied: boolean;
  onSave: (job: JobListing) => void;
}

/** "Nusantara Cloud Tech" -> "NC" */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function JobCard({ job, match, isApplied, onSave }: JobCardProps) {
  const missingSet = new Set(match.missing);
  const level = getMatchLevel(match.score);

  return (
    <article className="kotak job-card">
      <header className="job-card__head">
        <span className="avatar">{getInitials(job.company_name)}</span>
        <div className="job-card__company">
          <strong>{job.company_name}</strong>
          <span className="muted small">{job.candidate_required_location}</span>
        </div>
        <span className={`badge badge--${level}`}>{match.score}% Match</span>
      </header>

      <h3 className="job-card__title">{job.title}</h3>

      {job.tags.length > 0 ? (
        <ul className="tag-list">
          {job.tags.map((tag, index) => (
            <li
              key={`${tag}-${index}`}
              className={missingSet.has(tag) ? "tag tag--missing" : "tag"}
              title={
                missingSet.has(tag) ? "Skill belum kamu kuasai" : "Skill cocok"
              }
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">Lowongan ini tidak mencantumkan skill.</p>
      )}

      <p className="muted small">
        {match.matched.length} cocok · {match.missing.length} kurang
      </p>

      <footer className="job-card__foot">
        <span className="salary">{job.salary}</span>
        <button
          type="button"
          className="btn btn--primary"
          disabled={isApplied}
          onClick={() => onSave(job)}
        >
          {isApplied ? "Sudah Dilamar" : "Simpan ke Wishlist"}
        </button>
      </footer>
    </article>
  );
}

export default JobCard;
