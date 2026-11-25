import { useEffect, useState } from "react";
const QUESTIONS = [
  "Ceritakan proyek IT yang pernah kamu buat, peranmu, dan tantangan terbesarnya.",
  "Apa perbedaan props dan state pada React? Berikan contoh penggunaannya.",
  "Bagaimana kamu mencari dan memperbaiki bug yang sulit direproduksi?",
  "Jelaskan kegunaan useEffect dan mengapa cleanup diperlukan.",
  "Bagaimana kamu bekerja sama saat terjadi konflik perubahan kode di Git?",
  "Mengapa kamu tertarik magang di perusahaan ini dan apa yang ingin kamu pelajari?",
];
export default function InterviewTimer() {
  const [question, setQuestion] = useState(0);
  const [seconds, setSeconds] = useState(120);
  const [running, setRunning] = useState(false);
  const expired = seconds === 0;
  useEffect(() => {
    if (!running || expired) return;
    const intervalId = window.setInterval(
      () => setSeconds((previous) => Math.max(0, previous - 1)),
      1000,
    );
    return () => window.clearInterval(intervalId);
  }, [running, expired]);
  function reset() {
    setRunning(false);
    setSeconds(120);
  }
  const clock = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  return (
    <section className="prep-timer" aria-label="Latihan interview">
      <div className="detail-heading">
        <h3 className="subsection-title">Latihan Interview</h3>
        <span>
          Soal {question + 1} / {QUESTIONS.length}
        </span>
      </div>
      <p>{QUESTIONS[question]}</p>
      <output className="timer-clock" aria-label="Sisa waktu">
        {clock}
      </output>
      <p role="status" className="muted small">
        {expired
          ? "Waktu habis! Lanjut ke soal berikutnya atau reset."
          : running
            ? "Latihan berlangsung"
            : "Siap latihan · 2 menit per soal"}
      </p>
      <div className="detail-actions">
        <button
          className="btn btn--primary"
          disabled={expired}
          onClick={() => setRunning((value) => !value)}
        >
          {running && !expired ? "Pause" : seconds < 120 ? "Lanjut" : "Start"}
        </button>
        <button className="btn" onClick={reset}>
          Reset
        </button>
        <button
          className="btn"
          onClick={() => {
            setQuestion((value) => (value + 1) % QUESTIONS.length);
            reset();
          }}
        >
          {question === QUESTIONS.length - 1
            ? "Kembali ke Soal Pertama"
            : "Soal Berikutnya"}
        </button>
      </div>
    </section>
  );
}
