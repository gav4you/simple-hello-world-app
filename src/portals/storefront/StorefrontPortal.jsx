import React, { Suspense } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { pagesConfig } from '@/pages.config';

const RouteFallback = ({ label = 'Loading…' }) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
);

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout
  ? <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/**
 * Public storefront portal mounted at /s/*.
 *
 * NOTE: pages may still require backend settings allowing public browsing.
 * We deliberately do NOT hard-gate on auth here; the pages themselves
 * can show friendly messaging if auth is required.
 */
export default function StorefrontPortal() {
  const { schoolSlug } = useParams();
  // schoolSlug is consumed by pages via useParams; this helps keep the portal boundary clear.
  void schoolSlug;

  return (
    <Routes>
      <Route
        index
        element={
          <LayoutWrapper currentPageName="SchoolLanding">
            <Suspense fallback={<RouteFallback label="Loading school…" />}>
              {Pages.SchoolLanding ? <Pages.SchoolLanding /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="courses"
        element={
          <LayoutWrapper currentPageName="SchoolCourses">
            <Suspense fallback={<RouteFallback label="Loading catalog…" />}>
              {Pages.SchoolCourses ? <Pages.SchoolCourses /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="course/:courseId"
        element={
          <LayoutWrapper currentPageName="CourseSales">
            <Suspense fallback={<RouteFallback label="Loading course…" />}>
              {Pages.CourseSales ? <Pages.CourseSales /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="pricing"
        element={
          <LayoutWrapper currentPageName="SchoolPricing">
            <Suspense fallback={<RouteFallback label="Loading pricing…" />}>
              {Pages.SchoolPricing ? <Pages.SchoolPricing /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="checkout"
        element={
          <LayoutWrapper currentPageName="SchoolCheckout">
            <Suspense fallback={<RouteFallback label="Loading checkout…" />}>
              {Pages.SchoolCheckout ? <Pages.SchoolCheckout /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="thank-you"
        element={
          <LayoutWrapper currentPageName="SchoolThankYou">
            <Suspense fallback={<RouteFallback label="Loading…" />}>
              {Pages.SchoolThankYou ? <Pages.SchoolThankYou /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route
        path="certificate/:certificateId"
        element={
          <LayoutWrapper currentPageName="CertificateVerify">
            <Suspense fallback={<RouteFallback label="Verifying certificate…" />}>
              {Pages.CertificateVerify ? <Pages.CertificateVerify /> : <PageNotFound />}
            </Suspense>
          </LayoutWrapper>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
