# V9.0 Stable — Feature Registry (Reality Dump)
Prepared: January 01, 2026 (Asia/Jerusalem)

Source of truth:
- `src/components/config/features.jsx`

This registry powers:
- Left navigation groups (`src/Layout.jsx` via `getNavGroupsForAudience`)
- Vault discoverability (`src/pages/Vault.jsx`)
- Canonical route selection (`src/utils/index.ts`)

## Key policies
- **Never delete a feature** from the registry.
- If a page exists but is missing from the registry, add it as `hidden` (and/or `vaultOnly`) rather than omitting it.

## Known mismatch in v9.0 ZIP
The following page components are present in `pages.config` but are **not** in the feature registry:
- `TeachQuizEditor`
- `QuizTake`

Fix plan:
- Add registry entries for both (hidden), and reference their canonical routes:
  - `TeachQuizEditor` → `/teach/quizzes/new` (and `/teach/quizzes/:quizId`)
  - `QuizTake` → `/quiz/:quizId`

---

## Feature list (76)
| Feature key | Label | Canonical route | Area | Audiences | Nav order | Hidden | Vault only |
|---|---|---|---|---|---:|---|---|
| `SchoolAdmin` | School Admin | `/schooladmin` | `admin` | `admin` | 1 |  |  |
| `SchoolAnalytics` | School Analytics | `/schoolanalytics` | `admin` | `admin` | 2 |  |  |
| `SchoolMonetization` | Monetization | `/schoolmonetization` | `admin` | `admin` | 3 |  |  |
| `AuditLogViewer` | Audit Log | `/auditlogviewer` | `admin` | `admin` |  |  | ✅ |
| `SchoolNew` | Create School | `/schoolnew` | `admin` | `admin` |  | ✅ |  |
| `LegacyMigration` | Legacy Migration | `/legacymigration` | `admin` | `admin` |  |  | ✅ |
| `NetworkAdmin` | Network Admin | `/networkadmin` | `admin` | `admin` |  |  | ✅ |
| `AdminHardening` | Security Hardening | `/adminhardening` | `admin` | `admin` |  |  | ✅ |
| `SchoolStaff` | Staff Management | `/schoolstaff` | `admin` | `admin` |  |  | ✅ |
| `Dashboard` | Dashboard | `/dashboard` | `core` | `student,teacher,admin` | 1 |  |  |
| `Courses` | Courses | `/courses` | `core` | `student,teacher,admin` | 2 |  |  |
| `Reader` | Smart Reader | `/reader` | `core` | `student,teacher,admin` | 3 |  |  |
| `Feed` | Community | `/feed` | `core` | `student,teacher,admin` | 4 |  |  |
| `SchoolSearch` | Search | `/schoolsearch` | `core` | `student,teacher,admin` | 5 |  |  |
| `MyQuizzes` | My Quizzes | `/my-quizzes` | `core` | `student,teacher,admin` | 6 |  |  |
| `Account` | My Account | `/account` | `core` | `student,teacher,admin` | 10 |  |  |
| `Community` | Community | `/community` | `core` | `student,teacher,admin` |  |  | ✅ |
| `CourseDetail` | Course Detail | `/coursedetail` | `core` | `student,teacher,admin` |  | ✅ |  |
| `Downloads` | Downloads | `/downloads` | `core` | `student,teacher,admin` |  |  | ✅ |
| `Forums` | Forums | `/forums` | `core` | `student,teacher,admin` |  |  | ✅ |
| `LearningPaths` | Learning Paths | `/learningpaths` | `core` | `student,teacher,admin` |  |  | ✅ |
| `LessonViewer` | Lesson Viewer | `/lessonviewer` | `core` | `student,teacher,admin` |  | ✅ |  |
| `LessonViewerPremium` | Lesson Viewer Premium | `/lessonviewerpremium` | `core` | `student,teacher,admin` |  | ✅ |  |
| `Messages` | Messages | `/messages` | `core` | `student,teacher,admin` |  |  | ✅ |
| `MyProgress` | My Progress | `/myprogress` | `core` | `student` |  |  | ✅ |
| `Achievements` | Achievements | `/achievements` | `labs` | `student,teacher,admin` |  |  |  |
| `AdaptiveLearning` | Adaptive Learning | `/adaptivelearning` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Affiliate` | Affiliate Program | `/affiliate` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `AlumniNetwork` | Alumni Network | `/alumninetwork` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Analytics` | Analytics | `/analytics` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `CareerPaths` | Career Paths | `/careerpaths` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Challenges` | Challenges | `/challenges` | `labs` | `student,teacher,admin` |  |  |  |
| `CohortDetail` | Cohort Detail | `/cohortdetail` | `labs` | `student,teacher,admin` |  | ✅ |  |
| `Cohorts` | Cohorts | `/cohorts` | `labs` | `student,teacher,admin` |  |  |  |
| `Events` | Events | `/events` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `HabitTracker` | Habit Tracker | `/habittracker` | `labs` | `student` |  |  | ✅ |
| `LanguageLearning` | Languages | `/languagelearning` | `labs` | `student,teacher,admin` |  |  |  |
| `Languages` | Languages (Legacy) | `/languages` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Leaderboard` | Leaderboard | `/leaderboard` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `LiveStreams` | Live Streams | `/livestreams` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Marketplace` | Marketplace | `/marketplace` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Mentorship` | Mentorship | `/mentorship` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `Microlearning` | Microlearning | `/microlearning` | `labs` | `student` |  |  | ✅ |
| `StudySetNew` | New Study Set | `/studysetnew` | `labs` | `student,teacher,admin` |  | ✅ |  |
| `Offline` | Offline | `/offline` | `labs` | `student,teacher,admin` |  |  |  |
| `StudySetPractice` | Practice | `/studysetpractice` | `labs` | `student,teacher,admin` |  | ✅ |  |
| `RewardsShop` | Rewards Shop | `/rewardsshop` | `labs` | `student` |  |  | ✅ |
| `Scholarships` | Scholarships | `/scholarships` | `labs` | `student` |  |  | ✅ |
| `Skills` | Skills | `/skills` | `labs` | `student,teacher,admin` |  |  | ✅ |
| `StudyBuddies` | Study Buddies | `/studybuddies` | `labs` | `student` |  |  | ✅ |
| `StudySet` | Study Set | `/studyset` | `labs` | `student,teacher,admin` |  | ✅ |  |
| `StudySets` | Study Sets | `/studysets` | `labs` | `student,teacher,admin` |  |  |  |
| `Tournaments` | Tournaments | `/tournaments` | `labs` | `student` |  |  | ✅ |
| `AffiliateProgram` | Affiliate Program Info | `/affiliateprogram` | `marketing` | `public,student,teacher,admin` |  |  | ✅ |
| `CertificateVerify` | Certificate Verification | `/certificateverify` | `marketing` | `public` |  | ✅ |  |
| `SchoolCheckout` | Checkout | `/schoolcheckout` | `marketing` | `public,student,teacher,admin` |  | ✅ |  |
| `SchoolCourses` | Course Catalog | `/schoolcourses` | `marketing` | `public,student,teacher,admin` |  |  |  |
| `SchoolLanding` | Landing Page | `/schoollanding` | `marketing` | `public,student,teacher,admin` |  |  |  |
| `SchoolPricing` | Pricing | `/schoolpricing` | `marketing` | `public,student,teacher,admin` |  | ✅ |  |
| `CourseSales` | Sales Page | `/coursesales` | `marketing` | `public,student,teacher,admin` |  | ✅ |  |
| `SchoolThankYou` | Thank You | `/schoolthankyou` | `marketing` | `public,student,teacher,admin` |  | ✅ |  |
| `InviteAccept` | Accept Invite | `/inviteaccept` | `system` | `public` |  | ✅ |  |
| `Integrations` | Integrations | `/integrations` | `system` | `student,teacher,admin` |  |  |  |
| `Integrity` | Integrity Check | `/integrity` | `system` | `admin` |  |  | ✅ |
| `SchoolJoin` | Join School | `/schooljoin` | `system` | `student,teacher,admin` |  | ✅ |  |
| `oauth2callback` | OAuth Callback | `/oauth2callback` | `system` | `public` |  | ✅ |  |
| `Portfolio` | Profile | `/portfolio` | `system` | `student,teacher,admin` |  |  |  |
| `SchoolSelect` | School Select | `/schoolselect` | `system` | `student,teacher,admin` |  | ✅ |  |
| `Subscription` | Subscription | `/subscription` | `system` | `student,teacher,admin` |  | ✅ |  |
| `Vault` | Vault | `/vault` | `system` | `student,teacher,admin` |  |  |  |
| `Teach` | Teach | `/teach` | `teach` | `teacher,admin` | 1 |  |  |
| `TeachAnalytics` | Teaching Analytics | `/teachanalytics` | `teach` | `teacher,admin` | 2 |  |  |
| `TeachQuizzes` | Quizzes | `/teach/quizzes` | `teach` | `teacher,admin` | 3 |  |  |
| `TeachCourse` | Course Builder | `/teachcourse` | `teach` | `teacher,admin` |  | ✅ |  |
| `TeachLesson` | Lesson Editor | `/teachlesson` | `teach` | `teacher,admin` |  | ✅ |  |
| `TeachCourseNew` | New Course | `/teachcoursenew` | `teach` | `teacher,admin` |  | ✅ |  |
