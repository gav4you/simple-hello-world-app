import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

/**
 * v8.6 Drawer
 * Mobile-first side/bottom drawer wrapper.
 */
export default function SystemDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={contentClassName}>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        {children}
      </DrawerContent>
    </Drawer>
  );
}
