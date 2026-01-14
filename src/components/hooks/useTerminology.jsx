// Terminology Hook - Rav/Rabbi + Talmid/Bachur per school
import { useMemo } from 'react';

const TERMINOLOGY_PRESETS = {
  breslov: {
    teacher_singular: 'Rav',
    teacher_plural: 'Rabbanim',
    student_singular: 'talmid',
    student_plural: 'talmidim'
  },
  yeshiva: {
    teacher_singular: 'Rabbi',
    teacher_plural: 'Rabbanim',
    student_singular: 'bachur',
    student_plural: 'bachurim'
  },
  generic: {
    teacher_singular: 'Instructor',
    teacher_plural: 'Instructors',
    student_singular: 'Student',
    student_plural: 'Students'
  }
};

export const useTerminology = (school) => {
  const terms = useMemo(() => {
    const preset = school?.terminology_preset || 'breslov';
    const base = TERMINOLOGY_PRESETS[preset] || TERMINOLOGY_PRESETS.breslov;
    
    return {
      teacher_singular: school?.teacher_singular || base.teacher_singular,
      teacher_plural: school?.teacher_plural || base.teacher_plural,
      student_singular: school?.student_singular || base.student_singular,
      student_plural: school?.student_plural || base.student_plural
    };
  }, [school]);

  const roleLabelFor = (role) => {
    const r = role?.toUpperCase();
    if (r === 'INSTRUCTOR' || r === 'TA') return terms.teacher_singular;
    if (r === 'STUDENT') return terms.student_singular;
    if (r === 'ADMIN' || r === 'OWNER') return 'Admin';
    return role;
  };

  return {
    terms,
    presetName: school?.terminology_preset || 'breslov',
    roleLabelFor
  };
};