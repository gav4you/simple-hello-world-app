import React from 'react';
import PortalGate from '@/components/routing/PortalGate';
import AppPortal from '@/portals/app/AppPortal';

export default function SuperAdminPortal() {
  return (
    <PortalGate
      portalPrefix="/superadmin"
      intendedAudience="admin"
      allowedAudiences=['admin']
    >
      <AppPortal />
    </PortalGate>
  );
}
