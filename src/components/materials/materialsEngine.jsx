/**
 * Materials Retrieval Engine
 * Gated access to lesson content, videos, and resources
 */

import { base44 } from '@/api/base44Client';

/**
 * Determine if materials should be fetched based on access level
 * @param {string} accessLevel - FULL | PREVIEW | LOCKED | DRIP_LOCKED
 * @returns {boolean}
 */
export function shouldFetchMaterials(accessLevel) {
  return accessLevel === 'FULL' || accessLevel === 'PREVIEW';
}

/**
 * Get lesson material (scoped)
 * @param {object} params - {school_id, lesson_id, course_id}
 * @returns {Promise<object>} - Lesson content payload
 */
export async function getLessonMaterial({ school_id, lesson_id, course_id }) {
  try {
    // Fetch lesson metadata
    const lessons = await base44.entities.Lesson.filter({
      id: lesson_id,
      school_id
    });
    
    if (lessons.length === 0) return null;
    
    const lesson = lessons[0];
    
    // Return material payload
    return {
      content_text: lesson.content || '',
      video_url: lesson.video_url,
      audio_url: lesson.audio_url,
      duration_seconds: lesson.duration_seconds,
      lesson
    };
  } catch (error) {
    console.error('getLessonMaterial error:', error);
    return null;
  }
}

/**
 * Get preview-only material (truncated)
 * @param {object} material - Full material object
 * @param {object} policy - ContentProtectionPolicy
 * @returns {object} - Truncated material
 */
export function getPreviewMaterial(material, policy) {
  if (!material) return null;
  
  const maxChars = policy?.max_preview_chars || 1500;
  const maxSeconds = policy?.max_preview_seconds || 90;
  
  return {
    content_text: material.content_text 
      ? material.content_text.substring(0, maxChars) + (material.content_text.length > maxChars ? '...' : '')
      : '',
    video_url: material.video_url, // Player will enforce time limit
    audio_url: material.audio_url,
    duration_seconds: Math.min(material.duration_seconds || 0, maxSeconds),
    is_preview: true,
    preview_limit_chars: maxChars,
    preview_limit_seconds: maxSeconds
  };
}

/**
 * Sanitize material based on access level (CRITICAL SECURITY)
 * @param {object} material - Full material object
 * @param {string} accessLevel - FULL | PREVIEW | LOCKED | DRIP_LOCKED
 * @param {object} policy - ContentProtectionPolicy
 * @returns {object|null}
 */
export function sanitizeMaterialForAccess(material, accessLevel, policy) {
  // LOCKED and DRIP_LOCKED return nothing
  if (accessLevel === 'LOCKED' || accessLevel === 'DRIP_LOCKED') {
    return null;
  }
  
  // PREVIEW returns truncated
  if (accessLevel === 'PREVIEW') {
    return getPreviewMaterial(material, policy);
  }
  
  // FULL returns complete material (still wrapped in ProtectedContent)
  return material;
}

/**
 * Secure download URL retrieval
 * @param {object} params - {school_id, download_id, user_email, entitlements, policy}
 * @returns {Promise<object>} - {allowed, url, reason}
 */
export async function getSecureDownloadUrl({ 
  school_id, 
  download_id, 
  user_email, 
  entitlements,
  policy 
}) {
  try {
    // Get download record
    const downloads = await base44.entities.Download.filter({
      id: download_id,
      school_id
    });
    
    if (downloads.length === 0) {
      return { allowed: false, url: null, reason: 'not_found' };
    }
    
    const download = downloads[0];
    
    // Check if free
    const isFree = !download.course_id || download.price === 0;
    if (isFree) {
      // Log download
      try {
        await base44.entities.EventLog.create({
          school_id,
          user_email,
          event_type: 'download_granted',
          entity_type: 'DOWNLOAD',
          entity_id: download.id,
          metadata: { free: true }
        });
      } catch (e) {
        // Best effort
      }
      
      return { allowed: true, url: download.file_url, reason: 'free' };
    }
    
    // Check download license
    const hasDownloadLicense = entitlements.some(e => {
      const type = e.type || e.entitlement_type;
      return type === 'DOWNLOAD_LICENSE';
    });
    
    // Check course access
    const hasCourseAccess = download.course_id
      ? entitlements.some(e => {
          const type = e.type || e.entitlement_type;
          return (type === 'COURSE' && e.course_id === download.course_id) || type === 'ALL_COURSES';
        })
      : true;
    
    // Determine access
    let allowed = false;
    let reason = 'no_access';
    
    if (policy?.download_mode === 'INCLUDED_WITH_ACCESS') {
      allowed = hasCourseAccess;
      reason = allowed ? 'course_access' : 'course_required';
    } else if (policy?.download_mode === 'ADDON') {
      allowed = hasCourseAccess && hasDownloadLicense;
      reason = !hasCourseAccess ? 'course_required' : !hasDownloadLicense ? 'license_required' : 'addon_access';
    } else {
      // DISALLOW mode
      allowed = false;
      reason = 'downloads_disabled';
    }
    
    // Log attempt
    try {
      await base44.entities.EventLog.create({
        school_id,
        user_email,
        event_type: allowed ? 'download_granted' : 'download_blocked',
        entity_type: 'DOWNLOAD',
        entity_id: download.id,
        metadata: { reason, has_license: hasDownloadLicense, has_course: hasCourseAccess }
      });
    } catch (e) {
      // Best effort
    }
    
    return {
      allowed,
      url: allowed ? download.file_url : null,
      reason
    };
  } catch (error) {
    console.error('getSecureDownloadUrl error:', error);
    return { allowed: false, url: null, reason: 'error' };
  }
}