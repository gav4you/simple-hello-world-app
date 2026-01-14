import React from 'react';
import { Navigate } from 'react-router-dom';
import { PublicContentPage } from '@/portals/public/components/PublicContentPage';
import { useSession } from '@/components/hooks/useSession';

export default function PublicHome() {
  const { user, isLoading } = useSession();

  // v9.1: Guests see marketing home; authenticated users go straight to the app portal.
  if (!isLoading && user) return <Navigate to="/app" replace />;

  return <PublicContentPage routeKey="/" />;
}
