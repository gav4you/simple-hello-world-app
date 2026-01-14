import { useParams } from 'react-router-dom';

/**
 * Storefront Context Hook
 * Reads schoolSlug, courseId, offerId, transactionId from:
 * 1. Route params (canonical /s/:schoolSlug/* routes)
 * 2. Query params (legacy ?slug=, ?courseId=, ?offerId=, ?transactionId=)
 * 3. LocalStorage refCode (affiliate tracking)
 */
export default function useStorefrontContext() {
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);

  const schoolSlug = params.schoolSlug || urlParams.get('slug');
  const courseId = params.courseId || urlParams.get('courseId');
  const offerId = params.offerId || urlParams.get('offerId');
  const transactionId = params.transactionId || urlParams.get('transactionId');
  
  // Affiliate referral code from query or localStorage
  const refCode = urlParams.get('ref') || localStorage.getItem('referral_code');
  
  // Store ref code for session if present
  if (urlParams.get('ref')) {
    localStorage.setItem('referral_code', urlParams.get('ref'));
  }

  return {
    schoolSlug,
    courseId,
    offerId,
    transactionId,
    refCode
  };
}