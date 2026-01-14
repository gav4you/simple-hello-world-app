// Permission utility functions for multi-school access control

export const canManageSchool = (role) => {
  return ['OWNER', 'ADMIN'].includes(role);
};

export const canCreateCourses = (role) => {
  return ['OWNER', 'ADMIN', 'INSTRUCTOR', 'TA'].includes(role);
};

export const canModerateContent = (role) => {
  return ['OWNER', 'ADMIN', 'MODERATOR'].includes(role);
};

export const canEditContent = (authorEmail, userEmail, role) => {
  // User can edit their own content OR has moderator+ role
  return authorEmail === userEmail || canModerateContent(role);
};

export const hasSchoolAccess = async (userId, schoolId, base44) => {
  // Check if user has membership in the school
  const memberships = await base44.entities.SchoolMembership.filter({
    user_email: userId,
    school_id: schoolId
  });
  return memberships.length > 0;
};

export const getUserSchoolRole = async (userId, schoolId, base44) => {
  const memberships = await base44.entities.SchoolMembership.filter({
    user_email: userId,
    school_id: schoolId
  });
  return memberships.length > 0 ? memberships[0].role : null;
};