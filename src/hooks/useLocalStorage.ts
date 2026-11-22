// =====================================================================
// src/hooks/useLocalStorage.ts  —  PJ: Sean
// Custom Hook wajib (generic). Dipakai untuk `applications` & `kaptenSkills`.
// Pemakaian: const [apps, setApps] = useLocalStorage<Application[]>("applications", []);
// =====================================================================
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useLocalStorage<T>(
  _key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  // TODO (Sean): baca dari localStorage saat init + simpan tiap value berubah.
  // Sementara masih pakai useState biasa supaya app tetap jalan.
  return useState<T>(initialValue);
}
