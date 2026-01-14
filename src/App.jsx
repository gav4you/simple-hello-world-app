import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from '@/components/ui/toaster';
import NavigationTracker from '@/lib/NavigationTracker';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';
import { SessionProvider } from '@/components/hooks/useSession';
import TenancyBridge from '@/components/api/TenancyBridge';

// v9.1 portalization
import PublicLayout from '@/portals/public/PublicLayout';
import PublicHome from '@/portals/public/pages/PublicHome';
import PublicPricing from '@/portals/public/pages/PublicPricing';
import PublicAbout from '@/portals/public/pages/PublicAbout';
import PublicContact from '@/portals/public/pages/PublicContact';
import PublicHowItWorks from '@/portals/public/pages/PublicHowItWorks';
import PublicFAQ from '@/portals/public/pages/PublicFAQ';
import LoginChooser from '@/portals/public/pages/LoginChooser';
import LoginStudent from '@/portals/public/pages/LoginStudent';
import LoginTeacher from '@/portals/public/pages/LoginTeacher';
import LegalPrivacy from '@/portals/public/pages/LegalPrivacy';
import LegalTerms from '@/portals/public/pages/LegalTerms';

import AppPortal from '@/portals/app/AppPortal';
import StudentPortal from '@/portals/student/StudentPortal';
import TeacherPortal from '@/portals/teacher/TeacherPortal';
import AdminPortal from '@/portals/admin/AdminPortal';
import SuperAdminPortal from '@/portals/superadmin/SuperAdminPortal';

import StorefrontPortal from '@/portals/storefront/StorefrontPortal';
import LegacyToAppRedirect from '@/portals/LegacyToAppRedirect';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <TenancyBridge />
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <Routes>
              {/* Public marketing site */}
              <Route element={<PublicLayout />}>
                <Route index element={<PublicHome />} />
                <Route path="about" element={<PublicAbout />} />
                <Route path="how-it-works" element={<PublicHowItWorks />} />
                <Route path="pricing" element={<PublicPricing />} />
                <Route path="faq" element={<PublicFAQ />} />
                <Route path="contact" element={<PublicContact />} />

                {/* Dedicated logins (v9.1 spec) */}
                <Route path="login" element={<LoginChooser />} />
                <Route path="login/student" element={<LoginStudent />} />
                <Route path="login/teacher" element={<LoginTeacher />} />

                {/* Legal pages (must be public for OAuth branding) */}
                <Route path="privacy" element={<LegalPrivacy />} />
                <Route path="terms" element={<LegalTerms />} />

                {/* Legacy aliases */}
                <Route path="legal/privacy" element={<Navigate to="/privacy" replace />} />
                <Route path="legal/terms" element={<Navigate to="/terms" replace />} />
              </Route>

              {/* Public storefront portal (Teachable/Kajabi style) */}
              <Route path="/s/:schoolSlug/*" element={<StorefrontPortal />} />

              {/* Authenticated application portal */}
              <Route path="/app/*" element={<AppPortal />} />

              {/* v9.1 portal route groups */}
              <Route path="/student/*" element={<StudentPortal />} />
              <Route path="/teacher/*" element={<TeacherPortal />} />
              <Route path="/admin/*" element={<AdminPortal />} />
              <Route path="/superadmin/*" element={<SuperAdminPortal />} />

              {/* Legacy deep links -> active portal */}
              <Route path="*" element={<LegacyToAppRedirect />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
