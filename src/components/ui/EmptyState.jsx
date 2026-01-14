import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { tokens, cx } from '@/components/theme/tokens';

/**
 * v8.6 EmptyState
 * Standard empty / zero-state component.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  const Icon = icon;
  return (
    <GlassCard className={cx('p-8 sm:p-10 text-center', className)}>
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      {title && <div className={cx(tokens.text.h2, 'text-base sm:text-xl')}>{title}</div>}
      {description && <p className={cx(tokens.text.lead, 'mt-2')}>{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </GlassCard>
  );
}
