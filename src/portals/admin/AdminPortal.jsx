import React from 'react';
import PortalGate from '@/components/routing/PortalGate';
import AppPortal from '@/portals/app/AppPortal';

export default function AdminPortal() {
  return (
    <PortalGate
      portalPrefix="/admin"
      intendedAudience="admin"
      allowedAudiences=['admin']
    >
      <AppPortal />
    </PortalGate>
  );
}
