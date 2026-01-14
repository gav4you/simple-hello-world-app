import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * v8.6 StatusBadge
 * Simple semantic badge.
 */
export default function StatusBadge({ status, children, ...props }) {
  const s = (status || '').toLowerCase();
  let variant = 'secondary';
  if (['ok','success','active','enabled','paid'].includes(s)) variant = 'default';
  if (['warn','warning','pending'].includes(s)) variant = 'outline';
  if (['error','failed','blocked','disabled'].includes(s)) variant = 'destructive';
  return (
    <Badge variant={variant} {...props}>
      {children ?? status}
    </Badge>
  );
}
