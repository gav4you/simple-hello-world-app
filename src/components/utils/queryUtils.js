import { useEffect, useMemo, useState } from 'react';

export function clamp(n, min, max) {
  const v = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, v));
}

export function buildKey(...parts) {
  return parts.filter(Boolean);
}

// Debounce a value (search inputs)
export function useDebouncedValue(value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

// Simple client-side pagination helper
export function usePagination({ pageSize = 25, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);
  const size = clamp(pageSize, 5, 200);
  const next = () => setPage((p) => p + 1);
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => setPage(1);
  return useMemo(() => ({ page, pageSize: size, next, prev, setPage, reset }), [page, size]);
}
