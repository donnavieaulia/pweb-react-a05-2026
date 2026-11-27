// =====================================================================
// src/hooks/useLocalStorage.ts  —  PJ: Sean
// Custom Hook wajib (generic). Dipakai untuk `applications` & `kaptenSkills`.
// Pemakaian: const [apps, setApps] = useLocalStorage<Application[]>("applications", []);
// =====================================================================
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

function readFromStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initialValue;
    const parsed: unknown = JSON.parse(raw);
    return sanitize ? sanitize(parsed) : (parsed as T);
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readFromStorage(key, initialValue, sanitize),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Abaikan jika localStorage penuh atau diblokir oleh browser.
    }
  }, [key, value]);

  return [value, setValue];
}
