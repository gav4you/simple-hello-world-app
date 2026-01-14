import React from 'react';
import { cx } from '@/components/theme/tokens';

/**
 * v8.6 Stepper
 * Lightweight progress stepper for onboarding / checkout.
 */
export default function Stepper({ steps = [], current = 0, className }) {
  return (
    <ol className={cx('flex flex-wrap items-center gap-2', className)}>
      {steps.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={`${s}-${idx}`} className="flex items-center gap-2">
            <div
              className={cx(
                'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold',
                done ? 'bg-primary text-primary-foreground border-primary' : '',
                active ? 'border-primary text-primary' : 'border-border text-muted-foreground'
              )}
            >
              {idx + 1}
            </div>
            <span className={cx('text-sm', active ? 'text-foreground' : 'text-muted-foreground')}>
              {s}
            </span>
            {idx !== steps.length - 1 && (
              <div className={cx('mx-1 h-px w-8 bg-border/70')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
