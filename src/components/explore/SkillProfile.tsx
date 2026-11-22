// =====================================================================
// src/components/explore/SkillProfile.tsx  —  PJ: Dona
// Fitur 1 — Profil Skill Kapten: tambah/hapus skill, tolak duplikat,
// dan pilihan sumber data lowongan (Remotive / lokal).
// Skill disimpan di localStorage lewat useLocalStorage di App.tsx.
// =====================================================================
import { useState } from "react";
import type { FormEvent } from "react";
import type { JobSource } from "../../types";
import { normalizeSkill } from "../../utils/skillMatch";
import "./explore.css";

interface SkillProfileProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  source: JobSource;
  onChangeSource: (source: JobSource) => void;
}

function SkillProfile({
  skills,
  onAddSkill,
  onRemoveSkill,
  source,
  onChangeSource,
}: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const skill = newSkill.trim();

    if (skill === "") {
      setError("Skill tidak boleh kosong.");
      return;
    }

    const isDuplicate = skills.some(
      (s) => normalizeSkill(s) === normalizeSkill(skill),
    );
    if (isDuplicate) {
      setError(`Skill "${skill}" sudah ada.`);
      return;
    }

    onAddSkill(skill);
    setNewSkill("");
    setError("");
  }

  return (
    <aside className="kotak">
      <div className="kotak__body">
        <h2 className="section-title">Profil Skill Kapten</h2>
        <p className="muted small">
          Dipakai untuk menghitung persentase kecocokan tiap lowongan.
        </p>

        <form className="skill-form" onSubmit={handleSubmit}>
          <input
            className={error ? "input input--error" : "input"}
            value={newSkill}
            onChange={(e) => {
              setNewSkill(e.target.value);
              setError("");
            }}
            placeholder="Tambah skill..."
            aria-label="Skill baru"
          />
          <button type="submit" className="btn btn--primary">
            Tambah
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}

        {skills.length === 0 ? (
          <p className="muted small">
            Belum ada skill. Tambahkan minimal 1 skill.
          </p>
        ) : (
          <ul className="chip-list">
            {skills.map((skill) => (
              <li key={skill} className="chip">
                {skill}
                <button
                  type="button"
                  className="chip__remove"
                  onClick={() => onRemoveSkill(skill)}
                  aria-label={`Hapus skill ${skill}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <hr className="divider" />

        <h3 className="subsection-title">Sumber Data Lowongan</h3>
        <label className="radio">
          <input
            type="radio"
            name="job-source"
            checked={source === "remote"}
            onChange={() => onChangeSource("remote")}
          />
          Remotive API (Live)
        </label>
        <label className="radio">
          <input
            type="radio"
            name="job-source"
            checked={source === "local"}
            onChange={() => onChangeSource("local")}
          />
          Dataset Magang ID (Lokal)
        </label>
      </div>
    </aside>
  );
}

export default SkillProfile;
