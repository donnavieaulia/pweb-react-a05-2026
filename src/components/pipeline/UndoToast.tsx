// =====================================================================
// src/components/pipeline/UndoToast.tsx  —  PJ: Sean
// Fitur 6 — Toast Undo Delete 5 detik (timer via useRef + clearTimeout).
// =====================================================================
import { useEffect, useRef, useState } from "react";
import type { Application } from "../../types";
import "./pipeline.css";

interface UndoToastProps {
  deletedApp: Application;
  onUndo: () => void;
  onExpire: () => void;
}

const UNDO_SECONDS = 5;

function UndoToast({ deletedApp, onUndo, onExpire }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(UNDO_SECONDS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onExpireRef.current();
    }, UNDO_SECONDS * 1000);

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      clearInterval(intervalId);
    };
  }, []);

  function handleUndoClick() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onUndo();
  }

  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span>
        Lamaran <strong>{deletedApp.company}</strong> telah dihapus.
      </span>
      <button
        type="button"
        className="undo-toast__btn"
        onClick={handleUndoClick}
      >
        Undo ({secondsLeft}d)
      </button>
    </div>
  );
}

export default UndoToast;
