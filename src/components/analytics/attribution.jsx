/**
 * Attribution Tracking Module
 * Persists ref + UTM parameters across funnel with multi-tenant safety
 */

const STORAGE_KEY_PREFIX = 'attribution_';
const EXPIRY_DAYS = 14;

/**
 * Build storage key for school
 * @param {string} schoolSlug
 * @returns {string}
 */
function getStorageKey(schoolSlug) {
  return `${STORAGE_KEY_PREFIX}${schoolSlug}`;
}

/**
 * Check if attribution is expired
 * @param {object} attribution
 * @returns {boolean}
 */
export function isAttributionExpired(attribution) {
  if (!attribution || !attribution.captured_at) return true;
  
  const capturedAt = new Date(attribution.captured_at);
  const now = new Date();
  const daysDiff = (now - capturedAt) / (1000 * 60 * 60 * 24);
  
  return daysDiff > EXPIRY_DAYS;
}

/**
 * Capture attribution from URL
 * @param {object} params - {schoolSlug, forceCapture}
 * @returns {object|null} - Captured attribution or null
 */
export function captureAttributionFromUrl({ schoolSlug, forceCapture = false }) {
  if (!schoolSlug) return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmContent = urlParams.get('utm_content');
  const utmTerm = urlParams.get('utm_term');
  const gclid = urlParams.get('gclid');
  const fbclid = urlParams.get('fbclid');
  
  // Only capture if there's new data
  const hasNewData = ref || utmSource || utmCampaign || gclid || fbclid;
  if (!hasNewData && !forceCapture) {
    return getAttribution({ schoolSlug });
  }
  
  // Get existing attribution
  const existing = getAttribution({ schoolSlug });
  
  // Don't overwrite unless:
  // 1. No existing attribution
  // 2. New ref exists
  // 3. Existing is expired
  if (existing && !isAttributionExpired(existing) && !ref) {
    return existing;
  }
  
  const attribution = {
    ref: ref || existing?.ref || null,
    utm_source: utmSource || existing?.utm_source || null,
    utm_medium: utmMedium || existing?.utm_medium || null,
    utm_campaign: utmCampaign || existing?.utm_campaign || null,
    utm_content: utmContent || existing?.utm_content || null,
    utm_term: utmTerm || existing?.utm_term || null,
    gclid: gclid || existing?.gclid || null,
    fbclid: fbclid || existing?.fbclid || null,
    landing_path: window.location.pathname,
    landing_ts: new Date().toISOString(),
    captured_at: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(getStorageKey(schoolSlug), JSON.stringify(attribution));
  } catch (error) {
    console.warn('Failed to store attribution:', error);
  }
  
  return attribution;
}

/**
 * Get stored attribution
 * @param {object} params - {schoolSlug}
 * @returns {object|null}
 */
export function getAttribution({ schoolSlug }) {
  if (!schoolSlug) return null;
  
  try {
    const stored = localStorage.getItem(getStorageKey(schoolSlug));
    if (!stored) return null;
    
    const attribution = JSON.parse(stored);
    
    // Check expiry
    if (isAttributionExpired(attribution)) {
      clearAttribution({ schoolSlug });
      return null;
    }
    
    return attribution;
  } catch (error) {
    console.warn('Failed to read attribution:', error);
    return null;
  }
}

/**
 * Attach attribution to metadata object
 * @param {object} meta - Existing metadata
 * @param {object} attribution - Attribution data
 * @returns {object}
 */
export function attachAttribution(meta = {}, attribution) {
  if (!attribution) return meta;
  
  return {
    ...meta,
    attribution: {
      ref: attribution.ref,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      gclid: attribution.gclid,
      fbclid: attribution.fbclid,
      landing_path: attribution.landing_path,
      landing_ts: attribution.landing_ts
    }
  };
}

/**
 * Clear attribution for school
 * @param {object} params - {schoolSlug}
 */
export function clearAttribution({ schoolSlug }) {
  if (!schoolSlug) return;
  
  try {
    localStorage.removeItem(getStorageKey(schoolSlug));
  } catch (error) {
    console.warn('Failed to clear attribution:', error);
  }
}