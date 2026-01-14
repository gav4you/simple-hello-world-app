// Entitlement checking utilities for course access control

import { base44 } from '@/api/base44Client';

/**
 * Check if entitlement is active (expiry-aware)
 * @param {object} ent - Entitlement record
 * @param {Date} now - Current date
 * @returns {boolean}
 */
export function isEntitlementActive(ent, now = new Date()) {
  if (!ent) return false;
  
  const startsAt = ent.starts_at ? new Date(ent.starts_at) : null;
  const endsAt = ent.ends_at ? new Date(ent.ends_at) : null;
  
  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt <= now) return false;
  
  return true;
}

/**
 * Check if user has access to a course based on entitlements
 * @param {string} userEmail - User's email
 * @param {string} courseId - Course ID
 * @param {string} schoolId - School ID
 * @returns {Promise<boolean>} - Whether user has access
 */
export async function hasAccessToCourse(userEmail, courseId, schoolId) {
  if (!userEmail || !courseId || !schoolId) return false;

  const now = new Date();

  // Check for ALL_COURSES entitlement
  const allCoursesEntitlements = await base44.entities.Entitlement.filter({
    user_email: userEmail,
    school_id: schoolId,
    type: 'ALL_COURSES'
  });

  const validAllCourses = allCoursesEntitlements.some(e => isEntitlementActive(e, now));

  if (validAllCourses) return true;

  // Check for specific COURSE entitlement
  const courseEntitlements = await base44.entities.Entitlement.filter({
    user_email: userEmail,
    school_id: schoolId,
    type: 'COURSE',
    course_id: courseId
  });

  const validCourse = courseEntitlements.some(e => isEntitlementActive(e, now));

  return validCourse;
}

/**
 * Check if user has access based on course access_level and entitlements
 * @param {object} course - Course object
 * @param {string} userEmail - User's email
 * @param {string} userRole - User's role in school
 * @returns {Promise<boolean>}
 */
export async function checkCourseAccess(course, userEmail, userRole) {
  if (!course || !userEmail) return false;

  // Admins/Instructors always have access
  if (['OWNER', 'ADMIN', 'INSTRUCTOR'].includes(userRole)) {
    return true;
  }

  // FREE courses are accessible to all members
  if (course.access_level === 'FREE') {
    return true;
  }

  // PAID/PRIVATE courses require entitlement
  if (course.access_level === 'PAID' || course.access_level === 'PRIVATE') {
    return await hasAccessToCourse(userEmail, course.id, course.school_id);
  }

  // Legacy: check access_tier for backward compatibility
  if (course.access_tier === 'free') {
    return true;
  }

  return false;
}

/**
 * Create entitlements for a purchase or transaction (IDEMPOTENT)
 * @param {object} transaction - Transaction object
 * @param {object} offer - Offer object
 * @param {string} schoolId - School ID
 * @returns {Promise<object>} - {created, skipped}
 */
export async function createEntitlementsForPurchase(transaction, offer, schoolId) {
  const startsAt = new Date().toISOString();
  const created = [];
  const skipped = [];
  
  // Check existing entitlements to avoid duplicates
  const existing = await base44.entities.Entitlement.filter({
    school_id: schoolId,
    user_email: transaction.user_email,
    source_id: transaction.id
  });

  // Handle different offer types
  if (offer.offer_type === 'ADDON') {
    // Grant license entitlement (idempotent)
    const licenseType = offer.name.toLowerCase().includes('copy') ? 'COPY_LICENSE' : 'DOWNLOAD_LICENSE';
    
    const alreadyExists = existing.some(e => (e.type || e.entitlement_type) === licenseType);
    if (alreadyExists) {
      skipped.push({ type: licenseType, reason: 'already_exists' });
    } else {
      const ent = await base44.entities.Entitlement.create({
        school_id: schoolId,
        user_email: transaction.user_email,
        type: licenseType,
        source: 'PURCHASE',
        source_id: transaction.id,
        starts_at: startsAt
      });
      created.push(ent);
    }
    return { created, skipped };
  }
  
  if (offer.access_scope === 'ALL_COURSES' || offer.offer_type === 'SUBSCRIPTION') {
    const alreadyExists = existing.some(e => (e.type || e.entitlement_type) === 'ALL_COURSES');
    
    if (alreadyExists) {
      skipped.push({ type: 'ALL_COURSES', reason: 'already_exists' });
    } else {
      const ent = await base44.entities.Entitlement.create({
        school_id: schoolId,
        user_email: transaction.user_email,
        type: 'ALL_COURSES',
        source: 'PURCHASE',
        source_id: transaction.id,
        starts_at: startsAt
      });
      created.push(ent);
    }
  } else if (offer.access_scope === 'SELECTED_COURSES' || offer.offer_type === 'COURSE' || offer.offer_type === 'BUNDLE') {
    const offerCourses = await base44.entities.OfferCourse.filter({ 
      offer_id: offer.id 
    });
    
    for (const oc of offerCourses) {
      const alreadyExists = existing.some(e => 
        (e.type || e.entitlement_type) === 'COURSE' && e.course_id === oc.course_id
      );
      
      if (alreadyExists) {
        skipped.push({ type: 'COURSE', course_id: oc.course_id, reason: 'already_exists' });
      } else {
        const ent = await base44.entities.Entitlement.create({
          school_id: schoolId,
          user_email: transaction.user_email,
          type: 'COURSE',
          course_id: oc.course_id,
          source: 'PURCHASE',
          source_id: transaction.id,
          starts_at: startsAt
        });
        created.push(ent);
      }
    }
  }
  
  return { created, skipped };
}

/**
 * Create entitlements for a subscription
 * @param {object} subscription - Subscription object
 * @param {object} offer - Offer object
 * @param {string} schoolId - School ID
 */
export async function createEntitlementsForSubscription(subscription, offer, schoolId) {
  const startsAt = new Date().toISOString();
  const endsAt = subscription.current_period_end || subscription.end_date;
  
  if (offer.access_scope === 'ALL_COURSES') {
    await base44.entities.Entitlement.create({
      school_id: schoolId,
      user_email: subscription.user_email,
      type: 'ALL_COURSES',
      source: 'SUBSCRIPTION',
      source_id: subscription.id,
      starts_at: startsAt,
      ends_at: endsAt
    });
  } else if (offer.access_scope === 'SELECTED_COURSES') {
    const offerCourses = await base44.entities.OfferCourse.filter({ 
      offer_id: offer.id 
    });
    
    for (const oc of offerCourses) {
      await base44.entities.Entitlement.create({
        school_id: schoolId,
        user_email: subscription.user_email,
        type: 'COURSE',
        course_id: oc.course_id,
        source: 'SUBSCRIPTION',
        source_id: subscription.id,
        starts_at: startsAt,
        ends_at: endsAt
      });
    }
  }
}

/**
 * Check if user has copy license
 * @param {Array} entitlements - User entitlements
 * @returns {boolean}
 */
export function hasCopyLicense(entitlements) {
  return entitlements.some(e => e.entitlement_type === 'COPY_LICENSE' || e.type === 'COPY_LICENSE');
}

/**
 * Check if user has download license
 * @param {Array} entitlements - User entitlements
 * @returns {boolean}
 */
export function hasDownloadLicense(entitlements) {
  return entitlements.some(e => e.entitlement_type === 'DOWNLOAD_LICENSE' || e.type === 'DOWNLOAD_LICENSE');
}

/**
 * Determine if user can copy content
 * @param {object} params - { policy, entitlements, accessLevel }
 * @returns {boolean}
 */
export function canCopy({ policy, entitlements, accessLevel }) {
  if (!policy || accessLevel === 'LOCKED') return false;
  if (accessLevel === 'PREVIEW') return false;
  
  if (policy.copy_mode === 'INCLUDED_WITH_ACCESS') {
    return accessLevel === 'FULL';
  } else if (policy.copy_mode === 'ADDON') {
    // CRITICAL: Require BOTH course access AND license
    return accessLevel === 'FULL' && hasCopyLicense(entitlements);
  }
  
  return false;
}

/**
 * Determine if user can download content
 * @param {object} params - { policy, entitlements, accessLevel }
 * @returns {boolean}
 */
export function canDownload({ policy, entitlements, accessLevel }) {
  if (!policy || accessLevel === 'LOCKED') return false;
  if (accessLevel === 'PREVIEW') return false;
  
  if (policy.download_mode === 'INCLUDED_WITH_ACCESS') {
    return accessLevel === 'FULL';
  } else if (policy.download_mode === 'ADDON') {
    // CRITICAL: Require BOTH course access AND license
    return accessLevel === 'FULL' && hasDownloadLicense(entitlements);
  }
  
  return false;
}

/**
 * Process referral and create commission (IDEMPOTENT)
 * @param {object} transaction - Transaction object
 * @param {string} schoolId - School ID
 * @returns {Promise<object>} - {created, skipped}
 */
export async function processReferral(transaction, schoolId) {
  try {
    const refCode = transaction.metadata?.referral_code || transaction.metadata?.attribution?.ref;
    if (!refCode) return { created: null, skipped: 'no_ref' };
    
    // Check if referral already exists for this transaction (idempotent)
    const existingReferrals = await base44.entities.Referral.filter({
      school_id: schoolId,
      transaction_id: transaction.id
    });
    
    if (existingReferrals.length > 0) {
      return { created: null, skipped: 'already_exists' };
    }
    
    // Find affiliate
    const affiliates = await base44.entities.Affiliate.filter({
      school_id: schoolId,
      code: refCode
    });
    
    if (affiliates.length === 0) return { created: null, skipped: 'affiliate_not_found' };
    
    const affiliate = affiliates[0];
    const commissionCents = Math.floor(transaction.amount_cents * (affiliate.commission_rate / 100));
    
    // Create referral record
    const referral = await base44.entities.Referral.create({
      school_id: schoolId,
      affiliate_id: affiliate.id,
      referred_email: transaction.user_email,
      transaction_id: transaction.id,
      commission_cents: commissionCents,
      status: 'completed',
      converted_at: new Date().toISOString()
    });
    
    // Update affiliate totals
    await base44.entities.Affiliate.update(affiliate.id, {
      total_earnings_cents: (affiliate.total_earnings_cents || 0) + commissionCents,
      total_referrals: (affiliate.total_referrals || 0) + 1
    });
    
    return { created: referral, skipped: null };
  } catch (error) {
    console.error('Failed to process referral:', error);
    return { created: null, skipped: 'error', error: error.message };
  }
}

/**
 * Record coupon redemption (IDEMPOTENT)
 * @param {object} params - {school_id, coupon, transaction, user_email}
 */
export async function recordCouponRedemption({ school_id, coupon, transaction, user_email }) {
  try {
    // Check if already recorded
    const existing = await base44.entities.CouponRedemption.filter({
      school_id,
      transaction_id: transaction.id
    });
    
    if (existing.length > 0) {
      return { created: false, skipped: 'already_exists' };
    }
    
    await base44.entities.CouponRedemption.create({
      school_id,
      coupon_id: coupon.id,
      user_email,
      transaction_id: transaction.id,
      discount_cents: transaction.discount_cents || 0
    });
    
    // Increment coupon usage
    await base44.entities.Coupon.update(coupon.id, {
      usage_count: (coupon.usage_count || 0) + 1
    });
    
    return { created: true, skipped: null };
  } catch (error) {
    console.error('recordCouponRedemption error:', error);
    return { created: false, skipped: 'error' };
  }
}