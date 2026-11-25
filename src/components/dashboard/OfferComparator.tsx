// PJ: Rifki — normalisasi gaji menggunakan gaji tertinggi dari dua offer terpilih.
import { useState } from "react";
import type { Application } from "../../types";
import { calculateOfferScore } from "../../utils/offerScore";
import { calculateSkillMatch } from "../../utils/skillMatch";
import { formatRupiah } from "../pipeline/format";
import "./dashboard.css";
interface Props {
  applications: Application[];
  kaptenSkills: string[];
}
export default function OfferComparator({ applications, kaptenSkills }: Props) {
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const offers = applications.filter((app) => app.status === "OFFER");
  // Pilihan yang terhapus otomatis memakai offer yang masih tersedia; tidak menyalin data ke state.
  const offerA = offers.find((app) => app.id === selectedA) ?? offers[0];
  const offerB =
    offers.find((app) => app.id === selectedB && app.id !== offerA?.id) ??
    offers.find((app) => app.id !== offerA?.id);
  if (!offerA || !offerB)
    return (
      <section className="kotak">
        <div className="kotak__body">
          <h2 className="section-title">Bandingkan Offer</h2>
          <p>
            Butuh minimal 2 lamaran berstatus OFFER untuk membandingkan tawaran.
            Saat ini ada {offers.length} offer.
          </p>
        </div>
      </section>
    );
  const maxSalary = Math.max(offerA.salaryOffer ?? 0, offerB.salaryOffer ?? 0);
  const matchA = calculateSkillMatch(kaptenSkills, offerA.requiredSkills).score;
  const matchB = calculateSkillMatch(kaptenSkills, offerB.requiredSkills).score;
  const scoreA = calculateOfferScore(offerA, maxSalary, matchA);
  const scoreB = calculateOfferScore(offerB, maxSalary, matchB);
  const tied = Math.abs(scoreA.total - scoreB.total) < 0.000001;
  const rows = [
    ["Perusahaan", offerA.company, offerB.company],
    ["Posisi", offerA.role, offerB.role],
    [
      "Gaji",
      formatRupiah(offerA.salaryOffer ?? 0),
      formatRupiah(offerB.salaryOffer ?? 0),
    ],
    ["Mode Kerja", offerA.workMode, offerB.workMode],
    ["Skill Match", `${matchA}%`, `${matchB}%`],
    [
      "Poin Gaji (maks. 50)",
      scoreA.salaryPoints.toFixed(2),
      scoreB.salaryPoints.toFixed(2),
    ],
    [
      "Poin Mode (maks. 25)",
      scoreA.modePoints.toFixed(2),
      scoreB.modePoints.toFixed(2),
    ],
    [
      "Poin Skill (maks. 25)",
      scoreA.skillPoints.toFixed(2),
      scoreB.skillPoints.toFixed(2),
    ],
    ["Total Skor", scoreA.total.toFixed(2), scoreB.total.toFixed(2)],
  ];
  return (
    <section className="kotak">
      <header className="kotak__header">
        <h2 className="section-title">Bandingkan Offer</h2>
      </header>
      <div className="kotak__body">
        <div className="offer-selectors">
          <label>
            Offer A
            <select
              className="select"
              value={offerA.id}
              onChange={(event) => setSelectedA(event.target.value)}
            >
              {offers.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Offer B
            <select
              className="select"
              value={offerB.id}
              onChange={(event) => setSelectedB(event.target.value)}
            >
              {offers
                .filter((app) => app.id !== offerA.id)
                .map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="muted small">
          Gaji dinormalisasi terhadap gaji tertinggi dari dua offer terpilih.
          Bobot: gaji 50%, mode kerja 25%, kecocokan skill 25%.
        </p>
        <div className="offer-table-wrap">
          <table className="offer-table">
            <thead>
              <tr>
                <th scope="col">Kriteria</th>
                <th scope="col">Offer A</th>
                <th scope="col">Offer B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, a, b]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{a}</td>
                  <td>{b}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Rekomendasi</th>
                <td>
                  {tied || scoreA.total > scoreB.total ? (
                    <span className="badge badge--ok">
                      {tied ? "Skor Seri" : "Rekomendasi Terbaik"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {tied || scoreB.total > scoreA.total ? (
                    <span className="badge badge--ok">
                      {tied ? "Skor Seri" : "Rekomendasi Terbaik"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {tied && (
          <p role="status">
            Skor kedua offer sama. Pertimbangkan mentor, budaya kerja, dan
            kesempatan belajar.
          </p>
        )}
      </div>
    </section>
  );
}
