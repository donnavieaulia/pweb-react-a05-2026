// =====================================================================
// src/components/pipeline/format.ts  —  PJ: Sean
// Helper formatting tampilan untuk komponen pipeline.
// =====================================================================

/** Format string tanggal ISO/lokal ke format ringkas bahasa Indonesia. */
export function formatDateTime(value?: string): string {
  if (!value) return "-";
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return value;
  return new Date(ms).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format nominal gaji ke Rupiah. */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "Nusantara Cloud Tech" -> "NC" */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
