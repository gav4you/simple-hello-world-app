# Portal Feature Matrix (Derived from Feature Registry)
Prepared: January 01, 2026 (Asia/Jerusalem)

Source: `src/components/config/features.jsx`

| Portal classification | Feature key | Label | Route | Area | Audiences | Hidden | VaultOnly |
|---|---|---|---|---|---|---|---|
| `admin` | `SchoolAdmin` | School Admin | `/schooladmin` | `admin` | `admin` |  |  |
| `admin` | `SchoolAnalytics` | School Analytics | `/schoolanalytics` | `admin` | `admin` |  |  |
| `admin` | `SchoolMonetization` | Monetization | `/schoolmonetization` | `admin` | `admin` |  |  |
| `admin` | `AuditLogViewer` | Audit Log | `/auditlogviewer` | `admin` | `admin` |  | ✅ |
| `admin` | `SchoolNew` | Create School | `/schoolnew` | `admin` | `admin` | ✅ |  |
| `admin` | `LegacyMigration` | Legacy Migration | `/legacymigration` | `admin` | `admin` |  | ✅ |
| `admin` | `NetworkAdmin` | Network Admin | `/networkadmin` | `admin` | `admin` |  | ✅ |
| `admin` | `AdminHardening` | Security Hardening | `/adminhardening` | `admin` | `admin` |  | ✅ |
| `admin` | `SchoolStaff` | Staff Management | `/schoolstaff` | `admin` | `admin` |  | ✅ |
| `admin` | `Integrity` | Integrity Check | `/integrity` | `system` | `admin` |  | ✅ |
| `admin+others` | `Dashboard` | Dashboard | `/dashboard` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `Courses` | Courses | `/courses` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `Reader` | Smart Reader | `/reader` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `Feed` | Community | `/feed` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `SchoolSearch` | Search | `/schoolsearch` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `MyQuizzes` | My Quizzes | `/my-quizzes` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `Account` | My Account | `/account` | `core` | `student,teacher,admin` |  |  |
| `admin+others` | `Community` | Community | `/community` | `core` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `CourseDetail` | Course Detail | `/coursedetail` | `core` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Downloads` | Downloads | `/downloads` | `core` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Forums` | Forums | `/forums` | `core` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `LearningPaths` | Learning Paths | `/learningpaths` | `core` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `LessonViewer` | Lesson Viewer | `/lessonviewer` | `core` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `LessonViewerPremium` | Lesson Viewer Premium | `/lessonviewerpremium` | `core` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Messages` | Messages | `/messages` | `core` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Achievements` | Achievements | `/achievements` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `AdaptiveLearning` | Adaptive Learning | `/adaptivelearning` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Affiliate` | Affiliate Program | `/affiliate` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `AlumniNetwork` | Alumni Network | `/alumninetwork` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Analytics` | Analytics | `/analytics` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `CareerPaths` | Career Paths | `/careerpaths` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Challenges` | Challenges | `/challenges` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `CohortDetail` | Cohort Detail | `/cohortdetail` | `labs` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Cohorts` | Cohorts | `/cohorts` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `Events` | Events | `/events` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `LanguageLearning` | Languages | `/languagelearning` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `Languages` | Languages (Legacy) | `/languages` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Leaderboard` | Leaderboard | `/leaderboard` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `LiveStreams` | Live Streams | `/livestreams` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Marketplace` | Marketplace | `/marketplace` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `Mentorship` | Mentorship | `/mentorship` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `StudySetNew` | New Study Set | `/studysetnew` | `labs` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Offline` | Offline | `/offline` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `StudySetPractice` | Practice | `/studysetpractice` | `labs` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Skills` | Skills | `/skills` | `labs` | `student,teacher,admin` |  | ✅ |
| `admin+others` | `StudySet` | Study Set | `/studyset` | `labs` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `StudySets` | Study Sets | `/studysets` | `labs` | `student,teacher,admin` |  |  |
| `admin+others` | `AffiliateProgram` | Affiliate Program Info | `/affiliateprogram` | `marketing` | `public,student,teacher,admin` |  | ✅ |
| `admin+others` | `SchoolCheckout` | Checkout | `/schoolcheckout` | `marketing` | `public,student,teacher,admin` | ✅ |  |
| `admin+others` | `SchoolCourses` | Course Catalog | `/schoolcourses` | `marketing` | `public,student,teacher,admin` |  |  |
| `admin+others` | `SchoolLanding` | Landing Page | `/schoollanding` | `marketing` | `public,student,teacher,admin` |  |  |
| `admin+others` | `SchoolPricing` | Pricing | `/schoolpricing` | `marketing` | `public,student,teacher,admin` | ✅ |  |
| `admin+others` | `CourseSales` | Sales Page | `/coursesales` | `marketing` | `public,student,teacher,admin` | ✅ |  |
| `admin+others` | `SchoolThankYou` | Thank You | `/schoolthankyou` | `marketing` | `public,student,teacher,admin` | ✅ |  |
| `admin+others` | `Integrations` | Integrations | `/integrations` | `system` | `student,teacher,admin` |  |  |
| `admin+others` | `SchoolJoin` | Join School | `/schooljoin` | `system` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Portfolio` | Profile | `/portfolio` | `system` | `student,teacher,admin` |  |  |
| `admin+others` | `SchoolSelect` | School Select | `/schoolselect` | `system` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Subscription` | Subscription | `/subscription` | `system` | `student,teacher,admin` | ✅ |  |
| `admin+others` | `Vault` | Vault | `/vault` | `system` | `student,teacher,admin` |  |  |
| `admin+others` | `Teach` | Teach | `/teach` | `teach` | `teacher,admin` |  |  |
| `admin+others` | `TeachAnalytics` | Teaching Analytics | `/teachanalytics` | `teach` | `teacher,admin` |  |  |
| `admin+others` | `TeachQuizzes` | Quizzes | `/teach/quizzes` | `teach` | `teacher,admin` |  |  |
| `admin+others` | `TeachCourse` | Course Builder | `/teachcourse` | `teach` | `teacher,admin` | ✅ |  |
| `admin+others` | `TeachLesson` | Lesson Editor | `/teachlesson` | `teach` | `teacher,admin` | ✅ |  |
| `admin+others` | `TeachCourseNew` | New Course | `/teachcoursenew` | `teach` | `teacher,admin` | ✅ |  |
| `public` | `CertificateVerify` | Certificate Verification | `/certificateverify` | `marketing` | `public` | ✅ |  |
| `public` | `InviteAccept` | Accept Invite | `/inviteaccept` | `system` | `public` | ✅ |  |
| `public` | `oauth2callback` | OAuth Callback | `/oauth2callback` | `system` | `public` | ✅ |  |
| `student` | `MyProgress` | My Progress | `/myprogress` | `core` | `student` |  | ✅ |
| `student` | `HabitTracker` | Habit Tracker | `/habittracker` | `labs` | `student` |  | ✅ |
| `student` | `Microlearning` | Microlearning | `/microlearning` | `labs` | `student` |  | ✅ |
| `student` | `RewardsShop` | Rewards Shop | `/rewardsshop` | `labs` | `student` |  | ✅ |
| `student` | `Scholarships` | Scholarships | `/scholarships` | `labs` | `student` |  | ✅ |
| `student` | `StudyBuddies` | Study Buddies | `/studybuddies` | `labs` | `student` |  | ✅ |
| `student` | `Tournaments` | Tournaments | `/tournaments` | `labs` | `student` |  | ✅ |