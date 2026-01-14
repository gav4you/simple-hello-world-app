// FEATURE REGISTRY - Single Source of Truth
// DO NOT delete features from this registry. Only add.
// Last updated: v9.0 (Quizzes + access hook hardening)

export const FEATURE_AREAS = {
  core: { label: 'Core Learning', color: 'bg-blue-100 text-blue-800', order: 1 },
  teach: { label: 'Teaching Tools', color: 'bg-green-100 text-green-800', order: 2 },
  admin: { label: 'Administration', color: 'bg-purple-100 text-purple-800', order: 3 },
  marketing: { label: 'Marketing & Sales', color: 'bg-amber-100 text-amber-800', order: 4 },
  labs: { label: 'Labs & Experiments', color: 'bg-pink-100 text-pink-800', order: 5 },
  system: { label: 'System & Utilities', color: 'bg-slate-100 text-slate-800', order: 6 }
};

export const FEATURES = {
  // CORE LEARNING
  dashboard: { key: 'Dashboard', label: 'Dashboard', route: '/dashboard', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Home', order: 1 },
  courses: { key: 'Courses', label: 'Courses', route: '/courses', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'BookOpen', order: 2 },
  courseDetail: { key: 'CourseDetail', label: 'Course Detail', route: '/coursedetail', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Book', hidden: true },
  lessonViewer: { key: 'LessonViewer', label: 'Lesson Viewer', route: '/lessonviewer', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Play', hidden: true },
  lessonViewerPremium: { key: 'LessonViewerPremium', label: 'Lesson Viewer Premium', route: '/lessonviewerpremium', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Play', hidden: true },
  reader: { key: 'Reader', label: 'Smart Reader', route: '/reader', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'BookMarked', order: 3 },
  feed: { key: 'Feed', label: 'Community', route: '/feed', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Users', order: 4 },
  schoolSearch: { key: 'SchoolSearch', label: 'Search', route: '/schoolsearch', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Search', order: 5 },
  myProgress: { key: 'MyProgress', label: 'My Progress', route: '/myprogress', area: 'core', audiences: ['student'], icon: 'TrendingUp', vaultOnly: true },
  downloads: { key: 'Downloads', label: 'Downloads', route: '/downloads', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Download', vaultOnly: true },
  myQuizzes: { key: 'MyQuizzes', label: 'My Quizzes', route: '/my-quizzes', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'ClipboardCheck', order: 6 },
  
quizTake: { key: 'QuizTake', label: 'Take Quiz', route: '/QuizTake', area: 'core', audiences: ['student', 'teacher', 'admin'], hidden: true },
  // TEACHING
  teach: { key: 'Teach', label: 'Teach', route: '/teach', area: 'teach', audiences: ['teacher', 'admin'], icon: 'GraduationCap', order: 1 },
  teachCourse: { key: 'TeachCourse', label: 'Course Builder', route: '/teachcourse', area: 'teach', audiences: ['teacher', 'admin'], icon: 'Edit', hidden: true },
  teachCourseNew: { key: 'TeachCourseNew', label: 'New Course', route: '/teachcoursenew', area: 'teach', audiences: ['teacher', 'admin'], icon: 'Plus', hidden: true },
  teachLesson: { key: 'TeachLesson', label: 'Lesson Editor', route: '/teachlesson', area: 'teach', audiences: ['teacher', 'admin'], icon: 'FileEdit', hidden: true },
  teachQuizzes: { key: 'TeachQuizzes', label: 'Quizzes', route: '/teach/quizzes', area: 'teach', audiences: ['teacher', 'admin'], icon: 'ClipboardList', order: 3 },
teachQuizEditor: { key: 'TeachQuizEditor', label: 'Quiz Editor', route: '/TeachQuizEditor', area: 'teach', audiences: ['teacher', 'admin'], hidden: true },
  teachAnalytics: { key: 'TeachAnalytics', label: 'Teaching Analytics', route: '/teachanalytics', area: 'teach', audiences: ['teacher', 'admin'], icon: 'BarChart', order: 2 },
  
  // ADMIN
  schoolAdmin: { key: 'SchoolAdmin', label: 'School Admin', route: '/schooladmin', area: 'admin', audiences: ['admin'], icon: 'Settings', order: 1 },
  schoolAnalytics: { key: 'SchoolAnalytics', label: 'School Analytics', route: '/schoolanalytics', area: 'admin', audiences: ['admin'], icon: 'TrendingUp', order: 2 },
  schoolMonetization: { key: 'SchoolMonetization', label: 'Monetization', route: '/schoolmonetization', area: 'admin', audiences: ['admin'], icon: 'DollarSign', order: 3 },
  schoolNew: { key: 'SchoolNew', label: 'Create School', route: '/schoolnew', area: 'admin', audiences: ['admin'], icon: 'Plus', hidden: true },
  schoolJoin: { key: 'SchoolJoin', label: 'Join School', route: '/schooljoin', area: 'system', audiences: ['student', 'teacher', 'admin'], hidden: true },
  adminHardening: { key: 'AdminHardening', label: 'Security Hardening', route: '/adminhardening', area: 'admin', audiences: ['admin'], icon: 'Shield', vaultOnly: true },
  legacyMigration: { key: 'LegacyMigration', label: 'Legacy Migration', route: '/legacymigration', area: 'admin', audiences: ['admin'], icon: 'Database', vaultOnly: true },
  
  // MARKETING & STOREFRONT
  // PUBLIC MARKETING (guest routes)
  publicHome: { key: 'PublicHome', label: 'Home', route: '/', area: 'marketing', audiences: ['public'], hidden: true },
  publicAbout: { key: 'PublicAbout', label: 'About', route: '/about', area: 'marketing', audiences: ['public'], hidden: true },
  publicHowItWorks: { key: 'PublicHowItWorks', label: 'How It Works', route: '/how-it-works', area: 'marketing', audiences: ['public'], hidden: true },
  publicPricing: { key: 'PublicPricing', label: 'Pricing', route: '/pricing', area: 'marketing', audiences: ['public'], hidden: true },
  publicFAQ: { key: 'PublicFAQ', label: 'FAQ', route: '/faq', area: 'marketing', audiences: ['public'], hidden: true },
  publicContact: { key: 'PublicContact', label: 'Contact', route: '/contact', area: 'marketing', audiences: ['public'], hidden: true },

  loginChooserPublic: { key: 'LoginChooserPublic', label: 'Login', route: '/login', area: 'marketing', audiences: ['public'], hidden: true },
  loginStudentPublic: { key: 'LoginStudentPublic', label: 'Student Login', route: '/login/student', area: 'marketing', audiences: ['public'], hidden: true },
  loginTeacherPublic: { key: 'LoginTeacherPublic', label: 'Teacher Login', route: '/login/teacher', area: 'marketing', audiences: ['public'], hidden: true },

  legalPrivacy: { key: 'LegalPrivacy', label: 'Privacy Policy', route: '/privacy', aliases: ['/legal/privacy'], area: 'marketing', audiences: ['public'], hidden: true },
  legalTerms: { key: 'LegalTerms', label: 'Terms of Service', route: '/terms', aliases: ['/legal/terms'], area: 'marketing', audiences: ['public'], hidden: true },


  schoolLanding: { key: 'SchoolLanding', label: 'Landing Page', route: '/schoollanding', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'Globe' },
  schoolCourses: { key: 'SchoolCourses', label: 'Course Catalog', route: '/schoolcourses', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'Library' },
  courseSales: { key: 'CourseSales', label: 'Sales Page', route: '/coursesales', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'ShoppingBag', hidden: true },
  schoolPricing: { key: 'SchoolPricing', label: 'Pricing', route: '/schoolpricing', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'DollarSign', hidden: true },
  schoolCheckout: { key: 'SchoolCheckout', label: 'Checkout', route: '/schoolcheckout', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'CreditCard', hidden: true },
  schoolThankYou: { key: 'SchoolThankYou', label: 'Thank You', route: '/schoolthankyou', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], hidden: true },
  
  // LABS
  languageLearning: { key: 'LanguageLearning', label: 'Languages', route: '/languagelearning', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Globe' },
  // Router parity: pages.config includes /languages (legacy) and additional labs pages.
  languages: { key: 'Languages', label: 'Languages (Legacy)', route: '/languages', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Globe', vaultOnly: true },
  adaptiveLearning: { key: 'AdaptiveLearning', label: 'Adaptive Learning', route: '/adaptivelearning', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Brain', vaultOnly: true },
  alumniNetwork: { key: 'AlumniNetwork', label: 'Alumni Network', route: '/alumninetwork', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Network', vaultOnly: true },
  studySets: { key: 'StudySets', label: 'Study Sets', route: '/studysets', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Layers' },
  studySetNew: { key: 'StudySetNew', label: 'New Study Set', route: '/studysetnew', area: 'labs', audiences: ['student', 'teacher', 'admin'], hidden: true },
  studySetPractice: { key: 'StudySetPractice', label: 'Practice', route: '/studysetpractice', area: 'labs', audiences: ['student', 'teacher', 'admin'], hidden: true },
  cohorts: { key: 'Cohorts', label: 'Cohorts', route: '/cohorts', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Users' },
  cohortDetail: { key: 'CohortDetail', label: 'Cohort Detail', route: '/cohortdetail', area: 'labs', audiences: ['student', 'teacher', 'admin'], hidden: true },
  offline: { key: 'Offline', label: 'Offline', route: '/offline', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Download' },
  achievements: { key: 'Achievements', label: 'Achievements', route: '/achievements', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Award' },
  challenges: { key: 'Challenges', label: 'Challenges', route: '/challenges', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Trophy' },
  affiliate: { key: 'Affiliate', label: 'Affiliate Program', route: '/affiliate', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Users', vaultOnly: true },
  
  // SYSTEM
  schoolSelect: { key: 'SchoolSelect', label: 'School Select', route: '/schoolselect', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Building', hidden: true },
  integrations: { key: 'Integrations', label: 'Integrations', route: '/integrations', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Plug' },
  portfolio: { key: 'Portfolio', label: 'Profile', route: '/portfolio', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'User' },
  vault: { key: 'Vault', label: 'Vault', route: '/vault', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Archive' },
  oauth2callback: { key: 'oauth2callback', label: 'OAuth Callback', route: '/oauth2callback', area: 'system', audiences: ['public'], hidden: true },
  integrity: { key: 'Integrity', label: 'Integrity Check', route: '/integrity', area: 'system', audiences: ['admin'], icon: 'CheckCircle', vaultOnly: true },
  subscription: { key: 'Subscription', label: 'Subscription', route: '/subscription', area: 'system', audiences: ['student', 'teacher', 'admin'], hidden: true },
  
  // Additional pages from router
  analytics: { key: 'Analytics', label: 'Analytics', route: '/analytics', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'BarChart', vaultOnly: true },
  careerPaths: { key: 'CareerPaths', label: 'Career Paths', route: '/careerpaths', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Briefcase', vaultOnly: true },
  community: { key: 'Community', label: 'Community', route: '/community', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Users', vaultOnly: true },
  events: { key: 'Events', label: 'Events', route: '/events', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Calendar', vaultOnly: true },
  forums: { key: 'Forums', label: 'Forums', route: '/forums', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'MessageSquare', vaultOnly: true },
  habitTracker: { key: 'HabitTracker', label: 'Habit Tracker', route: '/habittracker', area: 'labs', audiences: ['student'], icon: 'CheckSquare', vaultOnly: true },
  leaderboard: { key: 'Leaderboard', label: 'Leaderboard', route: '/leaderboard', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Trophy', vaultOnly: true },
  learningPaths: { key: 'LearningPaths', label: 'Learning Paths', route: '/learningpaths', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Map', vaultOnly: true },
  liveStreams: { key: 'LiveStreams', label: 'Live Streams', route: '/livestreams', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Video', vaultOnly: true },
  marketplace: { key: 'Marketplace', label: 'Marketplace', route: '/marketplace', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Store', vaultOnly: true },
  mentorship: { key: 'Mentorship', label: 'Mentorship', route: '/mentorship', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Users', vaultOnly: true },
  messages: { key: 'Messages', label: 'Messages', route: '/messages', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Mail', vaultOnly: true },
  microlearning: { key: 'Microlearning', label: 'Microlearning', route: '/microlearning', area: 'labs', audiences: ['student'], icon: 'Zap', vaultOnly: true },
  rewardsShop: { key: 'RewardsShop', label: 'Rewards Shop', route: '/rewardsshop', area: 'labs', audiences: ['student'], icon: 'Gift', vaultOnly: true },
  scholarships: { key: 'Scholarships', label: 'Scholarships', route: '/scholarships', area: 'labs', audiences: ['student'], icon: 'Award', vaultOnly: true },
  skills: { key: 'Skills', label: 'Skills', route: '/skills', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Target', vaultOnly: true },
  studyBuddies: { key: 'StudyBuddies', label: 'Study Buddies', route: '/studybuddies', area: 'labs', audiences: ['student'], icon: 'Users', vaultOnly: true },
  studySet: { key: 'StudySet', label: 'Study Set', route: '/studyset', area: 'labs', audiences: ['student', 'teacher', 'admin'], hidden: true },
  tournaments: { key: 'Tournaments', label: 'Tournaments', route: '/tournaments', area: 'labs', audiences: ['student'], icon: 'Swords', vaultOnly: true },
  affiliateProgram: { key: 'AffiliateProgram', label: 'Affiliate Program Info', route: '/affiliateprogram', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'Share', vaultOnly: true },
  
  // v8.3 additions
  account: { key: 'Account', label: 'My Account', route: '/account', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'User', order: 10 },
  networkAdmin: { key: 'NetworkAdmin', label: 'Network Admin', route: '/networkadmin', area: 'admin', audiences: ['admin'], icon: 'Globe', vaultOnly: true },
  certificateVerify: { key: 'CertificateVerify', label: 'Certificate Verification', route: '/certificateverify', area: 'marketing', audiences: ['public'], hidden: true },
  
  // v8.5 additions
  schoolStaff: { key: 'SchoolStaff', label: 'Staff Management', route: '/schoolstaff', area: 'admin', audiences: ['admin'], icon: 'Users', vaultOnly: true },
  auditLogViewer: { key: 'AuditLogViewer', label: 'Audit Log', route: '/auditlogviewer', area: 'admin', audiences: ['admin'], icon: 'Shield', vaultOnly: true },
  inviteAccept: { key: 'InviteAccept', label: 'Accept Invite', route: '/inviteaccept', area: 'system', audiences: ['public'], hidden: true }
};

// Helper functions
export const normalizeAudienceFromRole = (role) => {
  if (!role) return 'student';
  const r = role.toUpperCase();
  if (r === 'OWNER' || r === 'ADMIN') return 'admin';
  if (r === 'INSTRUCTOR' || r === 'TA') return 'teacher';
  return 'student';
};

export const getFeatureByKey = (key) => FEATURES[key];

export const getFeaturesForAudience = (audience) => {
  return Object.values(FEATURES).filter(f => f.audiences.includes(audience));
};

export const getFeaturesByArea = (area) => {
  return Object.values(FEATURES).filter(f => f.area === area);
};

export const getAllRoutes = () => {
  const routes = [];
  Object.values(FEATURES).forEach((f) => {
    if (f?.route) routes.push(f.route);
    if (Array.isArray(f?.aliases)) {
      f.aliases.forEach((a) => {
        if (a) routes.push(a);
      });
    }
  });
  return Array.from(new Set(routes));
};

export const getNavGroupsForAudience = (audience) => {
  const groups = {};
  Object.values(FEATURES)
    .filter(f => !f.hidden && !f.vaultOnly && (f.showInMainNav !== false) && f.audiences.includes(audience))
    .forEach(feature => {
      if (!groups[feature.area]) {
        groups[feature.area] = {
          ...FEATURE_AREAS[feature.area],
          features: []
        };
      }
      groups[feature.area].features.push(feature);
    });
  
  // Sort features within each group by order
  Object.values(groups).forEach(group => {
    group.features.sort((a, b) => (a.order || 999) - (b.order || 999));
  });
  
  return Object.values(groups).sort((a, b) => a.order - b.order);
};