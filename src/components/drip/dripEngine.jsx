/**
 * Drip Scheduling Engine
 * Handles lesson release scheduling based on enrollment dates
 */

import { base44 } from '@/api/base44Client';

/**
 * Parse date safely
 */
export function parseDateSafe(value) {
  if (!value) return null;
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Get user's enrollment date for a course
 * @param {object} params - {school_id, user_email, course_id}
 * @returns {Promise<Date|null>}
 */
export async function getEnrollDate({ school_id, user_email, course_id }) {
  try {
    // Get entitlements for this course
    const entitlements = await base44.entities.Entitlement.filter({
      school_id,
      user_email
    });
    
    // Find relevant entitlements (COURSE or ALL_COURSES)
    const relevantEnts = entitlements.filter(e => {
      const type = e.type || e.entitlement_type;
      return (type === 'COURSE' && e.course_id === course_id) || type === 'ALL_COURSES';
    });
    
    if (relevantEnts.length === 0) return null;
    
    // Use earliest created_date as enroll date
    const dates = relevantEnts
      .map(e => parseDateSafe(e.created_date || e.starts_at))
      .filter(Boolean)
      .sort((a, b) => a - b);
    
    return dates[0] || null;
  } catch (error) {
    console.error('getEnrollDate error:', error);
    return null;
  }
}

/**
 * Compute lesson availability based on drip rules
 * @param {object} params - {lesson, enrollDate, now}
 * @returns {object} - {isAvailable, availableAt, reason}
 */
export function computeLessonAvailability({ lesson, enrollDate, now = new Date() }) {
  // Drip override date (explicit publish date)
  if (lesson.drip_publish_at) {
    const publishAt = parseDateSafe(lesson.drip_publish_at);
    if (publishAt) {
      return {
        isAvailable: publishAt <= now,
        availableAt: publishAt,
        reason: publishAt > now ? 'DRIP_DATE' : null
      };
    }
  }
  
  // Drip days after enrollment
  if (lesson.drip_days_after_enroll && enrollDate) {
    const availableAt = new Date(enrollDate);
    availableAt.setDate(availableAt.getDate() + lesson.drip_days_after_enroll);
    
    return {
      isAvailable: availableAt <= now,
      availableAt,
      reason: availableAt > now ? 'DRIP_DAYS' : null
    };
  }
  
  // No drip restrictions
  return {
    isAvailable: true,
    availableAt: null,
    reason: null
  };
}

/**
 * Format countdown for drip-locked lessons
 * @param {Date} availableAt - When lesson becomes available
 * @param {Date} now - Current time
 * @returns {object} - {days, hours, minutes, label}
 */
export function formatAvailabilityCountdown(availableAt, now = new Date()) {
  if (!availableAt || availableAt <= now) {
    return { days: 0, hours: 0, minutes: 0, label: 'Available now' };
  }
  
  const diff = availableAt - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { days, hours, minutes, label: `Available in ${days}d ${hours}h` };
  } else if (hours > 0) {
    return { days, hours, minutes, label: `Available in ${hours}h ${minutes}m` };
  } else {
    return { days, hours, minutes, label: `Available in ${minutes} minutes` };
  }
}