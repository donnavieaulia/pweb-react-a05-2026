// =====================================================================
// src/components/explore/JobExplorer.tsx  —  PJ: Dona
// Fitur 1 — Eksplorasi Lowongan:
//  - fetch di useEffect + AbortController (request lama dibatalkan)
//  - state Loading / Error (+ Coba Lagi & Fallback Lokal) / Kosong
//  - search pakai useDebounce(keyword, 400), filter kategori, sort Skill Match
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import type { Application, JobListing, JobSource } from "../../types";
import { fetchJobs } from "../../services/jobService";
import { useDebounce } from "../../hooks/useDebounce";
import { calculateSkillMatch } from "../../utils/skillMatch";
import { isDuplicateApplication } from "../../utils/application";
import JobCard from "./JobCard";
import "./explore.css";

type FetchStatus = "loading" | "error" | "success";
type SortKey = "match-desc" | "match-asc" | "default";

type FetchResult =
  | { key: string; ok: true; jobs: JobListing[] }
  | { key: string; ok: false; message: string };

interface JobExplorerProps {
  source: JobSource;
  onChangeSource: (source: JobSource) => void;
  kaptenSkills: string[];
  applications: Application[];
  onSaveJob: (job: JobListing) => void;
}

const ALL_CATEGORIES = "ALL";

function JobExplorer({
  source,
  onChangeSource,
  kaptenSkills,
  applications,
  onSaveJob,
}: JobExplorerProps) {
  // ---------- State data dari server ----------
  // reloadKey naik 1 = fetch ulang (tombol Coba Lagi)
  const [reloadKey, setReloadKey] = useState(0);
  // Hasil fetch terakhir, ditandai "key" request-nya
  const [result, setResult] = useState<FetchResult | null>(null);

  // Kunci request saat ini. Kalau source/reloadKey berubah, key berubah.
  const requestKey = `${source}-${reloadKey}`;

  // Status = derived state: kalau hasil terakhir bukan milik request ini, berarti masih loading
  const status: FetchStatus =
    result === null || result.key !== requestKey
      ? "loading"
      : result.ok
        ? "success"
        : "error";
  const jobs = useMemo(
    () =>
      result !== null && result.key === requestKey && result.ok
        ? result.jobs
        : [],
    [result, requestKey],
  );
  const errorMessage = result !== null && !result.ok ? result.message : "";

  // ---------- State filter ----------
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [sortKey, setSortKey] = useState<SortKey>("match-desc");
  const debouncedKeyword = useDebounce(keyword, 400);

  // ---------- Fetch + AbortController ----------
  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(source, controller.signal)
      .then((data) => {
        setResult({ key: requestKey, ok: true, jobs: data });
      })
      .catch((error: unknown) => {
        // Dibatalkan sengaja (ganti sumber / komponen ditutup) -> bukan error
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        let message = "Terjadi kesalahan yang tidak diketahui.";
        if (error instanceof TypeError) {
          message =
            "Tidak bisa terhubung ke server. Cek koneksi internet kamu.";
        } else if (error instanceof Error) {
          message = error.message;
        }
        setResult({ key: requestKey, ok: false, message });
      });

    // Cleanup: batalkan request kalau source berubah / retry / unmount
    return () => controller.abort();
  }, [source, requestKey]);

  // ---------- Derived state ----------
  const categories = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.category))).sort(),
    [jobs],
  );

  // Skill Match dihitung ulang otomatis tiap kaptenSkills berubah (tidak disimpan di state)
  const jobsWithMatch = useMemo(
    () =>
      jobs.map((job) => ({
        job,
        match: calculateSkillMatch(kaptenSkills, job.tags),
      })),
    [jobs, kaptenSkills],
  );

  const visibleJobs = useMemo(() => {
    const search = debouncedKeyword.trim().toLowerCase();

    const filtered = jobsWithMatch.filter(({ job }) => {
      const matchCategory =
        category === ALL_CATEGORIES || job.category === category;
      const matchSearch =
        search === "" ||
        job.title.toLowerCase().includes(search) ||
        job.company_name.toLowerCase().includes(search) ||
        job.tags.some((tag) => tag.toLowerCase().includes(search));
      return matchCategory && matchSearch;
    });

    if (sortKey === "default") return filtered;
    // Pakai salinan [...] supaya array asli tidak dimutasi oleh sort()
    return [...filtered].sort((a, b) =>
      sortKey === "match-desc"
        ? b.match.score - a.match.score
        : a.match.score - b.match.score,
    );
  }, [jobsWithMatch, debouncedKeyword, category, sortKey]);

  const isTyping = keyword !== debouncedKeyword;

  function resetFilters() {
    setKeyword("");
    setCategory(ALL_CATEGORIES);
  }

  // ---------- Render konten sesuai status ----------
  function renderContent() {
    if (status === "loading") {
      return (
        <div className="state-box">
          <span className="spinner" aria-hidden="true" />
          <p>Memuat lowongan...</p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="state-box state-box--error">
          <p>
            <strong>Gagal memuat lowongan.</strong> {errorMessage}
          </p>
          <div className="state-box__actions">
            <button
              type="button"
              className="btn"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Coba Lagi
            </button>
            {source === "remote" && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onChangeSource("local")}
              >
                Pakai Fallback Lokal
              </button>
            )}
          </div>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="state-box">
          <p>Belum ada lowongan dari sumber ini.</p>
        </div>
      );
    }

    if (visibleJobs.length === 0) {
      return (
        <div className="state-box">
          <p>Tidak ada lowongan yang cocok dengan pencarian atau filter.</p>
          <button type="button" className="btn" onClick={resetFilters}>
            Reset Filter
          </button>
        </div>
      );
    }

    return (
      <div className="job-grid">
        {visibleJobs.map(({ job, match }) => (
          <JobCard
            key={job.id}
            job={job}
            match={match}
            isApplied={isDuplicateApplication(
              applications,
              job.company_name,
              job.title,
            )}
            onSave={onSaveJob}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="kotak">
      <div className="kotak__body explorer">
        <div className="explorer__toolbar">
          <input
            type="search"
            className="input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari posisi, perusahaan, atau skill..."
            aria-label="Cari lowongan"
          />
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter kategori"
          >
            <option value={ALL_CATEGORIES}>Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Urutkan"
          >
            <option value="match-desc">Match Tertinggi</option>
            <option value="match-asc">Match Terendah</option>
            <option value="default">Urutan Asli</option>
          </select>
        </div>

        <p className="muted small explorer__info">
          {isTyping
            ? "Mengetik..."
            : status === "success"
              ? `Menampilkan ${visibleJobs.length} dari ${jobs.length} lowongan`
              : "\u00a0"}
        </p>

        {renderContent()}
      </div>
    </section>
  );
}

export default JobExplorer;
