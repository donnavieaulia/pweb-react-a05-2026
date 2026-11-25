// PJ: Rifki. Data utama tetap di App; state lokal hanya untuk input/tampilan.
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Application, ApplicationStatus, WorkMode } from "../../types";
import { WORK_MODES } from "../../types";
import {
  getNextStatuses,
  transitionApplication,
  validateTransition,
} from "../../utils/stateMachine";
import { formatDateTime, formatRupiah } from "../pipeline/format";
import InterviewTimer from "./InterviewTimer";
import "./detail.css";
interface Props {
  application: Application;
  onUpdate: (id: string, update: (current: Application) => Application) => void;
  onClose: () => void;
}
export default function ApplicationDetail({
  application: app,
  onUpdate,
  onClose,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [target, setTarget] = useState<ApplicationStatus | "">("");
  const [cvVersion, setCvVersion] = useState(app.cvVersion ?? "");
  const [appliedDate, setAppliedDate] = useState(app.appliedDate ?? "");
  const [interviewDateTime, setInterviewDateTime] = useState(
    app.interviewDateTime ?? "",
  );
  const [salary, setSalary] = useState(app.salaryOffer?.toString() ?? "");
  const [workMode, setWorkMode] = useState<WorkMode>(app.workMode);
  const [error, setError] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [note, setNote] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const nextStatuses = getNextStatuses(app.status);
  const done = app.checklist.filter((item) => item.done).length;
  const progress = app.checklist.length
    ? (done / app.checklist.length) * 100
    : 0;
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) {
      setError("Pilih status tujuan terlebih dahulu.");
      return;
    }
    const fields = {
      cvVersion,
      appliedDate,
      interviewDateTime,
      salaryOffer: Number(salary),
      workMode,
    };
    const message = validateTransition(app, target, fields);
    if (message) {
      setError(message);
      return;
    }
    const now = new Date().toISOString();
    const logId = crypto.randomUUID();
    onUpdate(app.id, (current) =>
      transitionApplication(current, target, fields, now, logId),
    );
    setError("");
    setTarget("");
  }
  function addChecklist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checklistText.trim()) return;
    const item = {
      id: crypto.randomUUID(),
      text: checklistText.trim(),
      done: false,
    };
    onUpdate(app.id, (current) => ({
      ...current,
      checklist: [...current.checklist, item],
    }));
    setChecklistText("");
  }
  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: `Catatan: ${note.trim()}`,
    };
    onUpdate(app.id, (current) => ({
      ...current,
      activityLogs: [log, ...current.activityLogs],
    }));
    setNote("");
  }
  return (
    <section
      className="kotak application-detail"
      aria-labelledby="detail-title"
    >
      <header className="kotak__header detail-heading">
        <div>
          <h2
            id="detail-title"
            ref={headingRef}
            tabIndex={-1}
            className="section-title"
          >
            {app.role} — {app.company}
          </h2>
          <span className="badge badge--ok">{app.status}</span>
        </div>
        <button className="btn" onClick={onClose}>
          Tutup Detail
        </button>
      </header>
      <div className="kotak__body">
        <p className="muted small">
          Mode: {app.workMode} · CV: {app.cvVersion || "Belum diisi"} · Tanggal
          melamar: {app.appliedDate || "Belum diisi"}
        </p>
        {app.interviewDateTime && (
          <p className="small">
            Jadwal interview: {formatDateTime(app.interviewDateTime)}
          </p>
        )}
        {app.salaryOffer !== undefined && (
          <p className="small">Gaji offer: {formatRupiah(app.salaryOffer)}</p>
        )}
        <div className="detail-grid">
          <div>
            <h3 className="subsection-title">Tahap Seleksi</h3>
            {nextStatuses.length === 0 ? (
              <p role="status">
                Status {app.status} bersifat final. Tidak ada perpindahan status
                berikutnya.
              </p>
            ) : (
              <form className="detail-form" onSubmit={submitStatus}>
                <label>
                  Status tujuan
                  <select
                    className="select"
                    value={target}
                    onChange={(event) => {
                      setTarget(event.target.value as ApplicationStatus | "");
                      setError("");
                    }}
                  >
                    <option value="">Pilih status tujuan</option>
                    {nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                {target === "APPLIED" && (
                  <>
                    <label>
                      Versi CV
                      <input
                        className="input"
                        value={cvVersion}
                        onChange={(event) => setCvVersion(event.target.value)}
                        required
                        placeholder="CV-Rifki-v2.pdf"
                      />
                    </label>
                    <label>
                      Tanggal melamar
                      <input
                        type="date"
                        className="input"
                        value={appliedDate}
                        onChange={(event) => setAppliedDate(event.target.value)}
                        required
                      />
                    </label>
                  </>
                )}
                {target === "INTERVIEW" && (
                  <label>
                    Jadwal interview
                    <input
                      type="datetime-local"
                      className="input"
                      value={interviewDateTime}
                      onChange={(event) =>
                        setInterviewDateTime(event.target.value)
                      }
                      required
                    />
                  </label>
                )}
                {target === "OFFER" && (
                  <>
                    <label>
                      Gaji offer (Rp)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="input"
                        value={salary}
                        onChange={(event) => setSalary(event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Mode kerja
                      <select
                        className="select"
                        value={workMode}
                        onChange={(event) =>
                          setWorkMode(event.target.value as WorkMode)
                        }
                      >
                        {WORK_MODES.map((mode) => (
                          <option key={mode}>{mode}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                {error && (
                  <p role="alert" className="error-text">
                    {error}
                  </p>
                )}
                <button className="btn btn--primary" type="submit">
                  Konfirmasi Status
                </button>
              </form>
            )}
            <hr className="divider" />
            <h3 className="subsection-title">Daftar Persiapan</h3>
            <p>
              {done}/{app.checklist.length} selesai
            </p>
            <progress
              className="checklist-progress"
              max={100}
              value={progress}
              aria-label="Progress checklist"
            />
            {app.checklist.length === 0 && (
              <p className="muted">
                Belum ada checklist. Tambahkan persiapan pertamamu.
              </p>
            )}
            <ul className="detail-checklist">
              {app.checklist.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        onUpdate(app.id, (current) => ({
                          ...current,
                          checklist: current.checklist.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, done: !entry.done }
                              : entry,
                          ),
                        }))
                      }
                    />
                    <span className={item.done ? "checklist-done" : ""}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    className="btn btn--danger"
                    aria-label={`Hapus checklist ${item.text}`}
                    onClick={() =>
                      onUpdate(app.id, (current) => ({
                        ...current,
                        checklist: current.checklist.filter(
                          (entry) => entry.id !== item.id,
                        ),
                      }))
                    }
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
            <form className="detail-inline" onSubmit={addChecklist}>
              <input
                className="input"
                aria-label="Checklist baru"
                placeholder="Tambah persiapan baru..."
                value={checklistText}
                onChange={(event) => setChecklistText(event.target.value)}
              />
              <button className="btn" disabled={!checklistText.trim()}>
                Tambah
              </button>
            </form>
          </div>
          <div>
            <button
              className="btn"
              aria-expanded={showTimer}
              onClick={() => setShowTimer((value) => !value)}
            >
              {showTimer ? "Tutup Latihan Interview" : "Buka Latihan Interview"}
            </button>
            {showTimer && <InterviewTimer />}
            <hr className="divider" />
            <h3 className="subsection-title">Riwayat Aktivitas</h3>
            <form className="detail-form" onSubmit={addNote}>
              <label>
                Catatan Kapten
                <textarea
                  className="input"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Tulis catatan lamaran..."
                />
              </label>
              <button className="btn" disabled={!note.trim()}>
                Simpan Catatan
              </button>
            </form>
            {app.activityLogs.length === 0 && (
              <p className="muted">Belum ada aktivitas.</p>
            )}
            <ol className="activity-list">
              {app.activityLogs.map((log) => (
                <li key={log.id}>
                  <time dateTime={log.timestamp} className="muted small">
                    {formatDateTime(log.timestamp)}
                  </time>
                  <p>{log.message}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
