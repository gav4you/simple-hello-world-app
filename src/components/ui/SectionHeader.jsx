import React from 'react';
import { tokens, cx } from '@/components/theme/tokens';

/**
 * v8.6 SectionHeader
 * Used inside PageShell for sub-sections.
 */
export default function SectionHeader({
  title,
  description,
  right,
  className,
}) {
  return (
    <div className={cx('flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {title && <h2 className={tokens.text.h2}>{title}</h2>}
        {description && <p className={cx(tokens.text.lead, 'mt-1')}>{description}</p>}
      </div>
      {right && <div className="flex flex-wrap gap-2">{right}</div>}
    </div>
  );
}
