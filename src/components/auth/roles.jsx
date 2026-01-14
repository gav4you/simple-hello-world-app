/**
 * RBAC Utilities
 * Normalizes roles and provides authorization helpers
 */

// Global admins list (env var or hardcoded)
const GLOBAL_ADMINS = (import.meta.env.VITE_GLOBAL_ADMINS || 'admin@breslov.com')
  .split(',')
  .map(e => e.trim());

/**
 * Normalize membership role to simplified role
 * @param {string} membershipRole - OWNER | ADMIN | INSTRUCTOR | STUDENT | TA | MODERATOR
 * @returns {string} - SCHOOL_OWNER | SCHOOL_ADMIN | RAV | STUDENT | GUEST
 */
export function normalizeRole(membershipRole) {
  if (!membershipRole) return 'GUEST';
  
  const roleMap = {
    'OWNER': 'SCHOOL_OWNER',
    'ADMIN': 'SCHOOL_ADMIN',
    'INSTRUCTOR': 'RAV',
    'TA': 'RAV',
    'MODERATOR': 'SCHOOL_ADMIN',
    'STUDENT': 'STUDENT'
  };
  
  return roleMap[membershipRole] || 'STUDENT';
}

/**
 * Check if user is school admin (owner or admin)
 * @param {string} role - Membership role
 * @returns {boolean}
 */
export function isSchoolAdmin(role) {
  return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can teach/create courses
 * @param {string} role - Membership role
 * @returns {boolean}
 */
export function isTeacher(role) {
  return isSchoolAdmin(role) || role === 'INSTRUCTOR' || role === 'TA';
}

/**
 * Check if user is global admin
 * @param {string} userEmail - User email
 * @returns {boolean}
 */
export function isGlobalAdmin(userEmail) {
  return GLOBAL_ADMINS.includes(userEmail);
}

/**
 * Get audience label for feature registry
 * @param {string} role - Membership role
 * @returns {string} - admin | teacher | student | public
 */
export function getAudience(role) {
  if (isSchoolAdmin(role)) return 'admin';
  if (isTeacher(role)) return 'teacher';
  return 'student';
}

/**
 * Require school admin role (throws if not admin)
 * @param {string} role - Membership role
 * @param {string} page - Page name for error message
 */
export function requireSchoolAdmin(role, page = 'this page') {
  if (!isSchoolAdmin(role)) {
    throw new Error(`School admin access required for ${page}`);
  }
}

/**
 * Require global admin (throws if not global admin)
 * @param {string} userEmail - User email
 * @param {string} page - Page name for error message
 */
export function requireGlobalAdmin(userEmail, page = 'this page') {
  if (!isGlobalAdmin(userEmail)) {
    throw new Error(`Global admin access required for ${page}`);
  }
}