import React from 'react';
import PortalGate from '@/components/routing/PortalGate';
import AppPortal from '@/portals/app/AppPortal';

export default function StudentPortal() {
  return (
    <PortalGate
      portalPrefix="/student"
      intendedAudience="student"
      allowedAudiences=['student','teacher','admin']
    >
      <AppPortal />
    </PortalGate>
  );
}
