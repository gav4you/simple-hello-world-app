/**
 * Analytics Event Tracker
 * Lightweight, best-effort event tracking with de-duplication
 */

import { base44 } from '@/api/base44Client';

// De-dupe cache (event+path within 5 seconds)
const recentEvents = new Map();
const DEDUPE_WINDOW = 5000; // 5 seconds

/**
 * Track analytics event
 * @param {object} params - {school_id, user_email?, event_type, entity_type?, entity_id?, metadata?, session_id?}
 */
export async function trackEvent({
  school_id,
  user_email,
  event_type,
  entity_type,
  entity_id,
  metadata = {},
  session_id
}) {
  if (!school_id || !event_type) return;
  
  // De-dupe check
  const key = `${school_id}_${event_type}_${entity_id || ''}`;
  const lastTime = recentEvents.get(key);
  const now = Date.now();
  
  if (lastTime && (now - lastTime) < DEDUPE_WINDOW) {
    return; // Skip duplicate
  }
  
  recentEvents.set(key, now);
  
  // Create event (best effort, never block UI)
  try {
    await base44.entities.AnalyticsEvent.create({
      school_id,
      user_email: user_email || null,
      event_type,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      metadata,
      session_id: session_id || getSessionId()
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track page view
 * @param {object} params - {school_id, user_email?, path, meta?}
 */
export async function trackPageView({ school_id, user_email, path, meta = {} }) {
  const eventTypeMap = {
    '/schoollanding': 'viewed_landing',
    '/schoolcourses': 'viewed_catalog',
    '/coursesales': 'viewed_course_sales',
    '/schoolpricing': 'viewed_pricing',
    '/schoolcheckout': 'started_checkout',
    '/schoolthankyou': 'completed_purchase'
  };
  
  const eventType = eventTypeMap[path.toLowerCase()] || 'page_view';
  
  return trackEvent({
    school_id,
    user_email,
    event_type: eventType,
    metadata: { path, ...meta }
  });
}

/**
 * Get or create session ID for funnel tracking
 */
function getSessionId() {
  let sid = sessionStorage.getItem('analytics_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('analytics_session_id', sid);
  }
  return sid;
}

/**
 * Cleanup old de-dupe cache entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, time] of recentEvents.entries()) {
    if (now - time > DEDUPE_WINDOW * 2) {
      recentEvents.delete(key);
    }
  }
}, 30000); // Cleanup every 30 seconds