// ADAPTER: Re-exports from canonical feature registry
// This file preserved for backwards compatibility
// DO NOT add features here - add to @/config/features instead

export * from '../config/features';

// Legacy FEATURES export (adapter)
import { FEATURES as CANONICAL_FEATURES } from '../config/features';
export const FEATURES_OLD = {
  // Core Learning (Everyone)
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'Home',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  courses: {
    key: 'courses',
    label: 'Courses',
    route: '/courses',
    icon: 'BookOpen',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  courseDetail: {
    key: 'coursedetail',
    label: 'Course Detail',
    route: '/coursedetail',
    icon: 'BookOpen',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: true,
    hidden: true
  },
  lessonViewer: {
    key: 'lessonviewerpremium',
    label: 'Lesson Viewer',
    route: '/lessonviewerpremium',
    icon: 'Play',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: true,
    hidden: true
  },
  reader: {
    key: 'reader',
    label: 'Smart Reader',
    route: '/reader',
    icon: 'Book',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  feed: {
    key: 'feed',
    label: 'Community',
    route: '/feed',
    icon: 'Users',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  search: {
    key: 'schoolsearch',
    label: 'Search',
    route: '/schoolsearch',
    icon: 'Search',
    area: 'core',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  
  // Teaching (Instructors)
  teach: {
    key: 'teach',
    label: 'Teach',
    route: '/teach',
    icon: 'BookMarked',
    area: 'teach',
    audiences: ['teacher', 'admin'],
    vaultOnly: false
  },
  teachCourse: {
    key: 'teachcourse',
    label: 'Course Builder',
    route: '/teachcourse',
    icon: 'Edit',
    area: 'teach',
    audiences: ['teacher', 'admin'],
    vaultOnly: true,
    hidden: true
  },
  teachLesson: {
    key: 'teachlesson',
    label: 'Lesson Editor',
    route: '/teachlesson',
    icon: 'FileEdit',
    area: 'teach',
    audiences: ['teacher', 'admin'],
    vaultOnly: true,
    hidden: true
  },
  teachAnalytics: {
    key: 'teachanalytics',
    label: 'Teaching Analytics',
    route: '/teachanalytics',
    icon: 'BarChart',
    area: 'teach',
    audiences: ['teacher', 'admin'],
    vaultOnly: false
  },
  
  // School Administration
  schoolAdmin: {
    key: 'schooladmin',
    label: 'School Admin',
    route: '/schooladmin',
    icon: 'Settings',
    area: 'admin',
    audiences: ['admin'],
    vaultOnly: false
  },
  schoolAnalytics: {
    key: 'schoolanalytics',
    label: 'School Analytics',
    route: '/schoolanalytics',
    icon: 'TrendingUp',
    area: 'admin',
    audiences: ['admin'],
    vaultOnly: false
  },
  
  // Public Marketing
  schoolLanding: {
    key: 'schoollanding',
    label: 'School Landing',
    route: '/schoollanding',
    icon: 'Globe',
    area: 'marketing',
    audiences: ['public', 'student', 'teacher', 'admin'],
    vaultOnly: true
  },
  schoolCourses: {
    key: 'schoolcourses',
    label: 'Course Catalog',
    route: '/schoolcourses',
    icon: 'Library',
    area: 'marketing',
    audiences: ['public', 'student', 'teacher', 'admin'],
    vaultOnly: true
  },
  courseSales: {
    key: 'coursesales',
    label: 'Course Sales Page',
    route: '/coursesales',
    icon: 'ShoppingBag',
    area: 'marketing',
    audiences: ['public', 'student', 'teacher', 'admin'],
    vaultOnly: true
  },
  schoolCheckout: {
    key: 'schoolcheckout',
    label: 'Checkout',
    route: '/schoolcheckout',
    icon: 'CreditCard',
    area: 'marketing',
    audiences: ['public', 'student', 'teacher', 'admin'],
    vaultOnly: true
  },
  
  // Labs & Advanced Features
  languageLearning: {
    key: 'languagelearning',
    label: 'Language Learning',
    route: '/languagelearning',
    icon: 'Languages',
    area: 'labs',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  studySets: {
    key: 'studysets',
    label: 'Study Sets',
    route: '/studysets',
    icon: 'Library',
    area: 'labs',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  cohorts: {
    key: 'cohorts',
    label: 'Cohorts',
    route: '/cohorts',
    icon: 'Users',
    area: 'labs',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  offline: {
    key: 'offline',
    label: 'Offline Mode',
    route: '/offline',
    icon: 'Download',
    area: 'labs',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  
  // System & Utilities
  schoolSelect: {
    key: 'schoolselect',
    label: 'School Select',
    route: '/schoolselect',
    icon: 'Building',
    area: 'system',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: true,
    hidden: true
  },
  integrations: {
    key: 'integrations',
    label: 'Integrations',
    route: '/integrations',
    icon: 'Plug',
    area: 'system',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  portfolio: {
    key: 'portfolio',
    label: 'Profile',
    route: '/portfolio',
    icon: 'User',
    area: 'system',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  vault: {
    key: 'vault',
    label: 'Vault (All Features)',
    route: '/vault',
    icon: 'Archive',
    area: 'system',
    audiences: ['student', 'teacher', 'admin'],
    vaultOnly: false
  },
  adminHardening: {
    key: 'adminhardening',
    label: 'Admin Hardening',
    route: '/adminhardening',
    icon: 'Shield',
    area: 'admin',
    audiences: ['admin'],
    vaultOnly: false
  }
};

export const getFeaturesByArea = (area) => {
  return Object.values(FEATURES).filter(f => f.area === area);
};

export const getFeaturesByAudience = (audience) => {
  return Object.values(FEATURES).filter(f => f.audiences.includes(audience));
};

export const getNavigableFeatures = () => {
  return Object.values(FEATURES).filter(f => !f.hidden);
};

export const getVaultFeatures = () => {
  return Object.values(FEATURES);
};