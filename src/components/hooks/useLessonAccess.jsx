// Lesson Access Control Hook
// v9.0: tenancy-safe, expiry-aware, drip-aware, and React-hook-rule compliant

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getEnrollDate, computeLessonAvailability, formatAvailabilityCountdown } from '../drip/dripEngine';
import { isEntitlementActive } from '../utils/entitlements';

const DEFAULT_POLICY = {
  protect_content: true,
  require_payment_for_materials: true,
  allow_previews: true,
  max_preview_seconds: 90,
  max_preview_chars: 1500,
  watermark_enabled: true,
  block_copy: true,
  block_print: true,
  copy_mode: 'DISALLOW',
  download_mode: 'DISALLOW',
};

export const useLessonAccess = (courseId, lessonId, user, schoolId) => {
  // Fetch content protection policy (scoped)
  const { data: policy = DEFAULT_POLICY } = useQuery({
    queryKey: ['protection-policy', schoolId],
    queryFn: async () => {
      const policies = await base44.entities.ContentProtectionPolicy.filter({ school_id: schoolId });
      return policies?.[0] || DEFAULT_POLICY;
    },
    enabled: !!schoolId,
    staleTime: 60_000,
  });

  // Fetch user entitlements (scoped + expiry-aware)
  const { data: entitlementsRaw = [] } = useQuery({
    queryKey: ['entitlements', schoolId, user?.email],
    queryFn: async () => {
      if (!user?.email || !schoolId) return [];
      return base44.entities.Entitlement.filter({
        school_id: schoolId,
        user_email: user.email,
      });
    },
    enabled: !!user?.email && !!schoolId,
    staleTime: 30_000,
  });

  // Fetch lesson (scoped)
  const { data: lesson = null } = useQuery({
    queryKey: ['lesson', schoolId, lessonId],
    queryFn: async () => {
      if (!lessonId || !schoolId) return null;
      const lessons = await base44.entities.Lesson.filter({ id: lessonId, school_id: schoolId });
      return lessons?.[0] || null;
    },
    enabled: !!lessonId && !!schoolId,
    staleTime: 30_000,
  });

  const now = useMemo(() => new Date(), []);

  const activeEntitlements = useMemo(() => {
    return (entitlementsRaw || []).filter((e) => isEntitlementActive(e, new Date()));
  }, [entitlementsRaw]);

  const hasCourseAccess = useMemo(() => {
    if (!courseId) return false;
    return activeEntitlements.some((e) => {
      const type = e.entitlement_type || e.type;
      return (type === 'COURSE' && e.course_id === courseId) || type === 'ALL_COURSES';
    });
  }, [activeEntitlements, courseId]);

  const previewAllowed = !!(policy?.allow_previews && lesson?.is_preview);

  // Enrollment date (for drip). Only needed if user has course access.
  const { data: enrollDate = null } = useQuery({
    queryKey: ['enroll-date', schoolId, user?.email, courseId],
    queryFn: () => getEnrollDate({
      school_id: schoolId,
      user_email: user.email,
      course_id: courseId,
    }),
    enabled: !!schoolId && !!user?.email && !!courseId && hasCourseAccess,
    staleTime: 5 * 60 * 1000,
  });

  // Base access level
  let accessLevel = hasCourseAccess ? 'FULL' : (previewAllowed ? 'PREVIEW' : 'LOCKED');
  let dripInfo = { isAvailable: true, availableAt: null, countdownLabel: null, reason: null };

  if (hasCourseAccess && lesson && enrollDate) {
    const availability = computeLessonAvailability({ lesson, enrollDate, now: new Date() });
    if (!availability.isAvailable) {
      accessLevel = 'DRIP_LOCKED';
      const countdown = formatAvailabilityCountdown(availability.availableAt, new Date());
      dripInfo = {
        isAvailable: false,
        availableAt: availability.availableAt,
        countdownLabel: countdown.label,
        reason: availability.reason,
      };
    }
  }

  // Licenses
  const hasCopyLicense = activeEntitlements.some((e) => {
    const type = e.entitlement_type || e.type;
    return type === 'COPY_LICENSE';
  });
  const hasDownloadLicense = activeEntitlements.some((e) => {
    const type = e.entitlement_type || e.type;
    return type === 'DOWNLOAD_LICENSE';
  });

  // CRITICAL: Add-ons require BOTH course access AND the license
  const canCopy = policy?.copy_mode === 'INCLUDED_WITH_ACCESS'
    ? accessLevel === 'FULL'
    : policy?.copy_mode === 'ADDON'
    ? (accessLevel === 'FULL' && hasCopyLicense)
    : false;

  const canDownload = policy?.download_mode === 'INCLUDED_WITH_ACCESS'
    ? accessLevel === 'FULL'
    : policy?.download_mode === 'ADDON'
    ? (accessLevel === 'FULL' && hasDownloadLicense)
    : false;

  const watermarkText = user ? `${user.email} • ${new Date().toLocaleDateString()}` : '';

  return {
    policy,
    entitlements: activeEntitlements,
    hasCourseAccess,
    previewAllowed,
    accessLevel,
    dripInfo,
    canCopy,
    canDownload,
    hasCopyLicense,
    hasDownloadLicense,
    watermarkText,
    maxPreviewSeconds: policy?.max_preview_seconds || DEFAULT_POLICY.max_preview_seconds,
    maxPreviewChars: policy?.max_preview_chars || DEFAULT_POLICY.max_preview_chars,
  };
};
