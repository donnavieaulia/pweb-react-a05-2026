// =====================================================================
// src/components/pipeline/ConflictBanner.tsx  —  PJ: Sean
// Fitur 3 — Banner Bentrok Jadwal Interview (cek dari seluruh data).
// =====================================================================
import { useMemo } from "react";
import type { Application } from "../../types";
import { findInterviewConflicts } from "../../utils/conflictCheck";
import { formatDateTime } from "./format";
import "./pipeline.css";

interface ConflictBannerProps {
  applications: Application[];
}

function ConflictBanner({ applications }: ConflictBannerProps) {
  const conflicts = useMemo(
    () => findInterviewConflicts(applications),
    [applications],
  );

  if (conflicts.length === 0) return null;

  return (
    <section className="conflict-banner" role="alert">
      <strong>
        Peringatan Bentrok Jadwal Interview ({conflicts.length} konflik)
      </strong>
      <p className="small">
        Ditemukan jadwal interview yang berselisih kurang dari 60 menit (dicek
        dari seluruh data lamaran):
      </p>
      <ul className="conflict-banner__list">
        {conflicts.map(([first, second]) => {
          const diffMinutes = Math.round(
            Math.abs(
              Date.parse(first.interviewDateTime!) -
                Date.parse(second.interviewDateTime!),
            ) /
              (1000 * 60),
          );

          return (
            <li key={`${first.id}-${second.id}`}>
              <strong>{first.company}</strong> ({first.role},{" "}
              {formatDateTime(first.interviewDateTime)}) vs{" "}
              <strong>{second.company}</strong> ({second.role},{" "}
              {formatDateTime(second.interviewDateTime)}) — selisih{" "}
              {diffMinutes} menit
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ConflictBanner;
