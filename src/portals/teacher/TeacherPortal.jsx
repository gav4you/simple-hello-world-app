import React from 'react';
import PortalGate from '@/components/routing/PortalGate';
import AppPortal from '@/portals/app/AppPortal';

export default function TeacherPortal() {
  return (
    <PortalGate
      portalPrefix="/teacher"
      intendedAudience="teacher"
      allowedAudiences=['teacher','admin']
    >
      <AppPortal />
    </PortalGate>
  );
}
