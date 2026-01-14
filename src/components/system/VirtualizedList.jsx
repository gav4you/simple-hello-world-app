import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * VirtualizedList (dependency-free)
 *
 * Goals:
 * - Prevent big lists from blocking the main thread.
 * - Avoid adding a new dependency (react-window / react-virtual).
 * - Keep layout stable + accessible.
 *
 * Strategy:
 * 1) Chunked rendering: render N items, then increment in idle time.
 * 2) content-visibility: auto on each row (lets the browser skip offscreen rendering).
 *
 * This is not perfect windowing, but it is extremely effective in practice
 * and keeps Base44 projects lean.
 */
export default function VirtualizedList({
  items,
  renderItem,
  initialCount = 30,
  chunkSize = 30,
  minIntervalMs = 120,
  className = '',
  rowClassName = '',
  getKey,
  empty,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const [visibleCount, setVisibleCount] = useState(Math.min(initialCount, safeItems.length));
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    setVisibleCount(Math.min(initialCount, safeItems.length));
  }, [safeItems.length, initialCount]);

  const canGrow = visibleCount < safeItems.length;

  const grow = () => {
    const now = Date.now();
    if (now - lastTickRef.current < minIntervalMs) return;
    lastTickRef.current = now;
    setVisibleCount((n) => Math.min(n + chunkSize, safeItems.length));
  };

  // Grow in idle time; fallback to RAF
  useEffect(() => {
    if (!canGrow) return;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        // eslint-disable-next-line no-undef
        window.requestIdleCallback(
          () => {
            if (cancelled) return;
            grow();
            schedule();
          },
          { timeout: 800 }
        );
      } else {
        rafRef.current = window.requestAnimationFrame(() => {
          if (cancelled) return;
          grow();
          schedule();
        });
      }
    };

    schedule();
    return () => {
      cancelled = true;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGrow, chunkSize, minIntervalMs]);

  const visibleItems = useMemo(() => safeItems.slice(0, visibleCount), [safeItems, visibleCount]);

  if (safeItems.length === 0) return empty || null;

  return (
    <div className={className}>
      {visibleItems.map((item, idx) => {
        const key = getKey ? getKey(item, idx) : item?.id || idx;
        return (
          <div
            key={key}
            className={rowClassName}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '1px 56px',
            }}
          >
            {renderItem(item, idx)}
          </div>
        );
      })}
      {canGrow ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => Math.min(n + chunkSize, safeItems.length))}
            className="rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-background/70"
            aria-label="Load more"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
