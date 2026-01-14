import React from 'react';
import { Button } from '@/components/ui/button';
import { tokens, cx } from '@/components/theme/tokens';

/**
 * v8.6 IconButton
 * Ensures aria-label + consistent focus ring for icon-only buttons.
 */
export default function IconButton({
  label,
  children,
  className,
  ...props
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cx(tokens.focus, className)}
      {...props}
    >
      {children}
    </Button>
  );
}
