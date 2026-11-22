// =====================================================================
// src/services/jobService.ts  —  PJ: Dona
// Ambil lowongan dari Remotive API (live) atau public/magang-fallback.json.
// Terima AbortSignal supaya request bisa dibatalkan (AbortController).
// =====================================================================
import type { JobListing, JobSource } from "../types";

export const REMOTIVE_URL =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";
export const FALLBACK_URL = "/magang-fallback.json";

export async function fetchJobs(
  _source: JobSource,
  _signal?: AbortSignal,
): Promise<JobListing[]> {
  // TODO (Dona): fetch sesuai source, cek response.ok, return data.jobs
  return [];
}
