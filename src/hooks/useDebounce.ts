// =====================================================================
// src/hooks/useDebounce.ts  —  PJ: Dona
// Custom Hook wajib. Pemakaian: const debounced = useDebounce(keyword, 400);
// Nilai baru baru "diteruskan" setelah user berhenti mengetik selama `delay` ms.
// =====================================================================
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Pasang timer: kalau `delay` ms lewat tanpa perubahan, update nilainya
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: kalau `value` berubah lagi sebelum timer selesai,
    // timer lama dibatalkan supaya tidak ikut jalan
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}
