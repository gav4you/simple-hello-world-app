import React from 'react';
import { tokens, cx } from '@/components/theme/tokens';

/**
 * v8.6 GlassCard
 * Glassmorphism surface that works in both light and dark mode.
 */
export default function GlassCard({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cx(tokens.glass.card, hover ? tokens.glass.cardHover : '', className)}
      {...props}
    >
      {children}
    </div>
  );
}
