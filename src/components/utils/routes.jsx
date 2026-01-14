// Route utilities and canonical path helpers

import { createPageUrl } from '@/utils';

/**
 * Create canonical storefront route
 * @param {string} schoolSlug - School slug
 * @param {string} path - Path segment (e.g., 'courses', 'pricing')
 * @returns {string} - Canonical route
 */
export function createStorefrontUrl(schoolSlug, path = '') {
  return `/s/${schoolSlug}${path ? `/${path}` : ''}`;
}

/**
 * Create canonical course sales route
 * @param {string} schoolSlug - School slug
 * @param {string} courseId - Course ID
 * @returns {string} - Canonical route
 */
export function createCourseSalesUrl(schoolSlug, courseId) {
  return `/s/${schoolSlug}/course/${courseId}`;
}

/**
 * Parse school slug from current URL or params
 * @returns {string|null} - School slug
 */
export function getCurrentSchoolSlug() {
  // Check URL path for /s/:slug pattern
  const match = window.location.pathname.match(/^\/s\/([^/]+)/);
  if (match) return match[1];
  
  // Fallback to query param
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

/**
 * Legacy route compatibility wrapper
 * Maps old createPageUrl usage to new canonical routes where applicable
 */
export function createPageUrlCompat(pageName, params = {}) {
  // If params include slug and target is a storefront page, use canonical
  if (params.slug) {
    const storefrontPages = {
      'SchoolLanding': '',
      'SchoolCourses': 'courses',
      'CourseSales': `course/${params.courseId}`,
      'SchoolPricing': 'pricing',
      'SchoolCheckout': 'checkout',
      'SchoolThankYou': 'thank-you'
    };
    
    if (storefrontPages[pageName] !== undefined) {
      return createStorefrontUrl(params.slug, storefrontPages[pageName]);
    }
  }
  
  // Default to standard createPageUrl
  return createPageUrl(pageName, params);
}