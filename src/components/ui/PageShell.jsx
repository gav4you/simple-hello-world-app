import React from 'react';
import { tokens, cx } from '@/components/theme/tokens';

/**
 * v8.6 PageShell
 * Standard wrapper for major pages. Keeps spacing/typography consistent.
 */
export default function PageShell({ title, subtitle, actions, children, className }) {
  return (
    <div className={tokens.page.outer}>
      <div className={cx(tokens.page.inner, 'py-8', className)}>
        {(title || subtitle || actions) && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title && <h1 className={tokens.text.h1}>{title}</h1>}
              {subtitle && <p className={cx(tokens.text.lead, 'mt-1')}>{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
