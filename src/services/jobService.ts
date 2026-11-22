// =====================================================================
// src/services/jobService.ts  —  PJ: Dona
// Ambil lowongan dari Remotive API (live) atau public/magang-fallback.json.
// Terima AbortSignal supaya request bisa dibatalkan (AbortController).
// =====================================================================
import type { JobApiResponse, JobListing, JobSource } from "../types";

export const REMOTIVE_URL =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";
export const FALLBACK_URL = "/magang-fallback.json";

/** Type guard: pastikan data dari internet bentuknya { jobs: [...] }. */
function isJobApiResponse(data: unknown): data is JobApiResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "jobs" in data &&
    Array.isArray(data.jobs)
  );
}

/** Rapikan 1 lowongan: isi nilai default kalau ada field yang kosong. */
function toJobListing(job: JobListing): JobListing {
  return {
    id: job.id,
    title: job.title ?? "Tanpa judul",
    company_name: job.company_name ?? "Perusahaan tidak diketahui",
    category: job.category ?? "Lainnya",
    candidate_required_location: job.candidate_required_location ?? "-",
    salary: job.salary || "Tidak dicantumkan",
    tags: Array.isArray(job.tags) ? job.tags : [],
  };
}

export async function fetchJobs(
  source: JobSource,
  signal?: AbortSignal,
): Promise<JobListing[]> {
  const url = source === "remote" ? REMOTIVE_URL : FALLBACK_URL;

  // `signal` dioper ke fetch -> kalau controller.abort() dipanggil, fetch berhenti
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Gagal memuat lowongan (HTTP ${response.status})`);
  }

  const data: unknown = await response.json();

  if (!isJobApiResponse(data)) {
    throw new Error("Format data lowongan tidak sesuai");
  }

  return data.jobs.map(toJobListing);
}
