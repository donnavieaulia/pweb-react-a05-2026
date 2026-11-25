// =====================================================================
// src/components/pipeline/WarRoom.tsx  —  PJ: Sean
// Fitur 3 — War Room: daftar lamaran, filter gabungan, sorting,
// tombol Simulasi +15 Hari, badge Rawan Ghosting.
// =====================================================================
import { useMemo, useState } from "react";
import type { Application, ApplicationStatus } from "../../types";
import { APPLICATION_STATUSES } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";
import { isRawanGhosting } from "../../utils/conflictCheck";
import { calculateSkillMatch, getMatchLevel } from "../../utils/skillMatch";
import { formatDateTime, formatRupiah, getInitials } from "./format";
import "./pipeline.css";

type StatusFilter = "ALL" | ApplicationStatus;
type SortOption = "newest" | "interview" | "offer";

interface WarRoomProps {
  applications: Application[];
  kaptenSkills: string[];
  onSimulateGhosting: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

function getStatusBadgeClass(status: ApplicationStatus): string {
  if (status === "OFFER") return "badge badge--ok";
  if (status === "REJECTED" || status === "GHOSTED") return "badge badge--bad";
  return "badge badge--warn";
}

function WarRoom({
  applications,
  kaptenSkills,
  onSimulateGhosting,
  onDelete,
  onOpenDetail,
}: WarRoomProps) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [onlyGhosting, setOnlyGhosting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const debouncedKeyword = useDebounce(keyword, 300);
  const isTyping = keyword !== debouncedKeyword;

  const visibleApplications = useMemo(() => {
    const search = debouncedKeyword.trim().toLowerCase();

    const filtered = applications.filter((app) => {
      const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
      const matchGhosting = !onlyGhosting || isRawanGhosting(app);
      const matchSearch =
        search === "" ||
        app.company.toLowerCase().includes(search) ||
        app.role.toLowerCase().includes(search) ||
        (app.cvVersion ?? "").toLowerCase().includes(search) ||
        app.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(search),
        );

      return matchStatus && matchGhosting && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "interview") {
        const aMs = a.interviewDateTime ? Date.parse(a.interviewDateTime) : NaN;
        const bMs = b.interviewDateTime ? Date.parse(b.interviewDateTime) : NaN;
        const aHas = !Number.isNaN(aMs);
        const bHas = !Number.isNaN(bMs);

        if (aHas && bHas) return aMs - bMs;
        if (aHas) return -1;
        if (bHas) return 1;
      }

      if (sortBy === "offer") {
        const aOffer = a.salaryOffer ?? -1;
        const bOffer = b.salaryOffer ?? -1;
        if (bOffer !== aOffer) return bOffer - aOffer;
      }

      return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
    });
  }, [applications, debouncedKeyword, statusFilter, onlyGhosting, sortBy]);

  function resetFilters() {
    setKeyword("");
    setStatusFilter("ALL");
    setOnlyGhosting(false);
    setSortBy("newest");
  }

  return (
    <section className="kotak">
      <div className="kotak__header kotak__header--hijau">
        <h2 className="section-title">War Room Pipeline</h2>
      </div>

      <div className="kotak__body">
        <div className="war-room__toolbar">
          <input
            type="search"
            className="input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari perusahaan, posisi, skill, atau versi CV..."
            aria-label="Cari lamaran"
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter status"
          >
            <option value="ALL">Semua Status</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Urutkan lamaran"
          >
            <option value="newest">Terbaru</option>
            <option value="interview">Jadwal Interview Terdekat</option>
            <option value="offer">Offer Tertinggi</option>
          </select>

          <label className="war-room__toggle">
            <input
              type="checkbox"
              checked={onlyGhosting}
              onChange={(e) => setOnlyGhosting(e.target.checked)}
            />
            <span>Hanya Rawan Ghosting</span>
          </label>
        </div>

        <p className="muted small war-room__info">
          {isTyping
            ? "Mengetik..."
            : `Menampilkan ${visibleApplications.length} dari ${applications.length} lamaran`}
        </p>

        {applications.length === 0 ? (
          <div className="pipeline-empty">
            <p>
              Belum ada lamaran. Simpan dari tab Eksplorasi Lowongan atau klik
              "+ Catat Lamaran".
            </p>
          </div>
        ) : visibleApplications.length === 0 ? (
          <div className="pipeline-empty">
            <p>Tidak ada lamaran yang cocok dengan filter aktif.</p>
            <button type="button" className="btn" onClick={resetFilters}>
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="pipeline-list">
            {visibleApplications.map((app) => {
              const ghosting = isRawanGhosting(app);
              const canSimulate =
                app.status === "APPLIED" || app.status === "SCREENING";
              const doneCount = app.checklist.filter(
                (item) => item.done,
              ).length;
              const match = calculateSkillMatch(
                kaptenSkills,
                app.requiredSkills,
              );
              const missingSet = new Set(match.missing);

              return (
                <article key={app.id} className="kotak pipeline-card">
                  <div className="pipeline-card__top">
                    <div className="pipeline-card__identity">
                      <span className="pipeline-card__avatar">
                        {getInitials(app.company)}
                      </span>
                      <div>
                        <h3 className="subsection-title">
                          {app.role} — {app.company}
                        </h3>
                        <p className="muted small">
                          Mode: {app.workMode} · CV: {app.cvVersion || "-"}
                          {app.interviewDateTime
                            ? ` · Jadwal Interview: ${formatDateTime(app.interviewDateTime)}`
                            : ""}
                          {app.salaryOffer
                            ? ` · Offer: ${formatRupiah(app.salaryOffer)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="pipeline-card__actions">
                      <span className={getStatusBadgeClass(app.status)}>
                        {app.status}
                      </span>

                      {ghosting && (
                        <span className="badge badge--bad">Rawan Ghosting</span>
                      )}

                      <span
                        className={`badge badge--${getMatchLevel(match.score)}`}
                      >
                        {match.score}% Match
                      </span>

                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => onOpenDetail(app.id)}
                      >
                        Detail
                      </button>

                      {canSimulate && (
                        <button
                          type="button"
                          className="btn"
                          onClick={() => onSimulateGhosting(app.id)}
                        >
                          Simulasi +15 Hari
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(app.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="pipeline-card__meta">
                    <span>
                      Checklist:{" "}
                      <strong>
                        {doneCount}/{app.checklist.length}
                      </strong>
                    </span>
                    <span className="muted">
                      Update terakhir: {formatDateTime(app.lastUpdatedAt)}
                    </span>
                  </div>

                  {app.requiredSkills.length > 0 && (
                    <ul className="pipeline-card__tags">
                      {app.requiredSkills.map((skill, index) => (
                        <li
                          key={`${skill}-${index}`}
                          className={
                            missingSet.has(skill)
                              ? "pipeline-card__tag pipeline-card__tag--missing"
                              : "pipeline-card__tag"
                          }
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default WarRoom;
