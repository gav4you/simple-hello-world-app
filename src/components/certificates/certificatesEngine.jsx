/**
 * Certificates Engine
 * Handles certificate issuance, verification, and email masking
 */

import { base44 } from '@/api/base44Client';

/**
 * Generate unique certificate ID
 * @returns {string}
 */
export function generateCertificateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Mask email for public display
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email || !email.includes('@')) return 'user@***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 3 
    ? local[0] + '***' + local[local.length - 1]
    : local[0] + '***';
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Get course completion status for user
 * @param {object} params - {school_id, user_email, course_id}
 * @returns {Promise<object>} - {completed, percent, completedCount, totalCount}
 */
export async function getCourseCompletionStatus({ school_id, user_email, course_id }) {
  try {
    // Get all lessons for course
    const lessons = await base44.entities.Lesson.filter({
      school_id,
      course_id,
      status: 'published'
    });
    
    if (lessons.length === 0) {
      return { completed: false, percent: 0, completedCount: 0, totalCount: 0 };
    }
    
    // Get user progress
    const progress = await base44.entities.UserProgress.filter({
      school_id,
      user_email,
      course_id
    });
    
    const completedCount = progress.filter(p => p.completed).length;
    const percent = Math.round((completedCount / lessons.length) * 100);
    const completed = percent === 100;
    
    return {
      completed,
      percent,
      completedCount,
      totalCount: lessons.length
    };
  } catch (error) {
    console.error('getCourseCompletionStatus error:', error);
    return { completed: false, percent: 0, completedCount: 0, totalCount: 0 };
  }
}

/**
 * Issue certificate if eligible (idempotent)
 * @param {object} params - {school_id, user_email, user_name, course_id, force}
 * @returns {Promise<object>} - Certificate record
 */
export async function issueCertificateIfEligible({ 
  school_id, 
  user_email, 
  user_name,
  course_id, 
  force = false 
}) {
  // Check if certificate already exists
  const existing = await base44.entities.Certificate.filter({
    school_id,
    user_email,
    course_id
  });
  
  if (existing.length > 0) {
    return existing[0]; // Idempotent
  }
  
  // Check completion if not forced
  if (!force) {
    const status = await getCourseCompletionStatus({ school_id, user_email, course_id });
    if (!status.completed) {
      throw new Error('Course not completed yet');
    }
  }
  
  // Get course details
  const courses = await base44.entities.Course.filter({ id: course_id, school_id });
  if (courses.length === 0) {
    throw new Error('Course not found');
  }
  
  const course = courses[0];
  
  // Create certificate
  const certificateId = generateCertificateId();
  
  const certificate = await base44.entities.Certificate.create({
    school_id,
    user_email,
    user_name: user_name || user_email,
    course_id,
    course_title: course.title,
    certificate_id: certificateId,
    issued_at: new Date().toISOString(),
    instructor_name: course.created_by || 'Instructor',
    completion_date: new Date().toISOString()
  });
  
  return certificate;
}

/**
 * Get certificate by ID (scoped)
 * @param {object} params - {school_id, certificate_id}
 * @returns {Promise<object|null>}
 */
export async function getCertificateById({ school_id, certificate_id }) {
  try {
    const certs = await base44.entities.Certificate.filter({
      school_id,
      certificate_id
    });
    return certs[0] || null;
  } catch (error) {
    console.error('getCertificateById error:', error);
    return null;
  }
}