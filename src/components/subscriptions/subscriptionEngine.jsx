/**
 * Subscription Lifecycle Engine
 * Handles status computation, expiry checks, and reconciliation
 */

import { base44 } from '@/api/base44Client';

/**
 * Compute current subscription status
 * @param {object} sub - Subscription record
 * @param {Date} now - Current date
 * @returns {string} - Computed status
 */
export function computeSubscriptionStatus(sub, now = new Date()) {
  if (!sub) return 'EXPIRED';
  
  const renewsAt = sub.current_period_end ? new Date(sub.current_period_end) : null;
  const canceledAt = sub.canceled_at ? new Date(sub.canceled_at) : null;
  const graceDays = sub.grace_days || 7;
  
  // Canceled subscriptions
  if (canceledAt) {
    if (renewsAt && renewsAt > now) {
      return 'CANCELED'; // Still active until period end
    }
    return 'EXPIRED';
  }
  
  // Check expiry
  if (!renewsAt) return 'ACTIVE'; // No expiry (lifetime)
  
  if (renewsAt > now) {
    return 'ACTIVE';
  }
  
  // Past renewal date
  const graceEnd = new Date(renewsAt);
  graceEnd.setDate(graceEnd.getDate() + graceDays);
  
  if (now <= graceEnd) {
    return 'PAST_DUE'; // Within grace period
  }
  
  return 'EXPIRED';
}

/**
 * Check if subscription provides access
 * @param {object} sub - Subscription record
 * @param {Date} now - Current date
 * @returns {boolean}
 */
export function isSubscriptionActive(sub, now = new Date()) {
  const status = computeSubscriptionStatus(sub, now);
  return status === 'ACTIVE' || status === 'PAST_DUE' || status === 'CANCELED';
}

/**
 * Reconcile subscriptions for a user
 * Updates subscription statuses based on current date
 * @param {object} params - {school_id, user_email}
 */
export async function reconcileSubscriptions({ school_id, user_email }) {
  try {
    const subs = await base44.entities.Subscription.filter({
      school_id,
      user_email
    });
    
    const now = new Date();
    
    for (const sub of subs) {
      const computedStatus = computeSubscriptionStatus(sub, now);
      
      // Update if status changed
      if (sub.status !== computedStatus) {
        await base44.entities.Subscription.update(sub.id, {
          status: computedStatus
        });
        
        // If expired, mark related entitlements as expired
        if (computedStatus === 'EXPIRED') {
          const entitlements = await base44.entities.Entitlement.filter({
            school_id,
            user_email,
            source: 'SUBSCRIPTION',
            source_id: sub.id
          });
          
          for (const ent of entitlements) {
            // Set ends_at to past if not set
            if (!ent.ends_at || new Date(ent.ends_at) > now) {
              await base44.entities.Entitlement.update(ent.id, {
                ends_at: now.toISOString()
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Reconcile subscriptions error:', error);
  }
}

/**
 * Check if entitlement is currently active
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
 * Get active entitlements only
 * @param {Array} entitlements - All entitlements
 * @returns {Array} - Active entitlements only
 */
export function getActiveEntitlements(entitlements) {
  const now = new Date();
  return entitlements.filter(ent => isEntitlementActive(ent, now));
}