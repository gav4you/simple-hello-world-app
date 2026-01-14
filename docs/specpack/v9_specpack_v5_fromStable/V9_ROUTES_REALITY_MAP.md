# V9.0 Stable — Route Map (Reality)
Prepared: January 01, 2026 (Asia/Jerusalem)

## How routing works in this codebase
The router is defined in `src/App.jsx`.

### 1) Main page
- `/` renders `pagesConfig.mainPage` (currently **Dashboard**) via `src/pages.config.js`.

### 2) Legacy Base44 page routes
For every entry in `pagesConfig.PAGES` (78 pages), the router registers:
- `/{PageKey}` (e.g. `/Dashboard`, `/Vault`)

Additionally, the router includes a case-insensitive fallback:
- `/:pageName` (e.g. `/dashboard` → matches `Dashboard`)

So **both** `/Dashboard` and `/dashboard` work.

### 3) Canonical human URLs (preferred)
Canonical URLs are defined in the **Feature Registry** at:
- `src/components/config/features.jsx`

Routing preference is applied by:
- `src/utils/index.ts` (`createPageUrl()` checks the registry first)

### 4) Explicit “special” routes (hard-coded)
These are registered explicitly before the generic page map:

**Quizzes (v9.0 canonical):**
- `/my-quizzes` → `Pages.MyQuizzes`
- `/quiz/:quizId` → `Pages.QuizTake`
- `/teach/quizzes` → `Pages.TeachQuizzes`
- `/teach/quizzes/new` → `Pages.TeachQuizEditor`
- `/teach/quizzes/:quizId` → `Pages.TeachQuizEditor`

**Storefront (guest-safe):**
- `/s/:schoolSlug` → `SchoolLanding`
- `/s/:schoolSlug/courses` → `SchoolCourses`
- `/s/:schoolSlug/course/:courseId` → `CourseSales`
- `/s/:schoolSlug/pricing` → `SchoolPricing`
- `/s/:schoolSlug/checkout` → `SchoolCheckout`
- `/s/:schoolSlug/thank-you` → `SchoolThankYou`
- `/s/:schoolSlug/certificate/:certificateId` → `CertificateVerify`

---

## Page registry → routes table (78 pages)
| PageKey | Canonical route (FEATURES) | Legacy route | Notes |
|---|---|---|---|
| `Account` | `/account` | `/Account` |  |
| `Achievements` | `/achievements` | `/Achievements` |  |
| `AdaptiveLearning` | `/adaptivelearning` | `/AdaptiveLearning` | vaultOnly |
| `AdminHardening` | `/adminhardening` | `/AdminHardening` | vaultOnly |
| `Affiliate` | `/affiliate` | `/Affiliate` | vaultOnly |
| `AffiliateProgram` | `/affiliateprogram` | `/AffiliateProgram` | vaultOnly |
| `AlumniNetwork` | `/alumninetwork` | `/AlumniNetwork` | vaultOnly |
| `Analytics` | `/analytics` | `/Analytics` | vaultOnly |
| `AuditLogViewer` | `/auditlogviewer` | `/AuditLogViewer` | vaultOnly |
| `CareerPaths` | `/careerpaths` | `/CareerPaths` | vaultOnly |
| `CertificateVerify` | `/certificateverify` | `/CertificateVerify` | hidden |
| `Challenges` | `/challenges` | `/Challenges` |  |
| `CohortDetail` | `/cohortdetail` | `/CohortDetail` | hidden |
| `Cohorts` | `/cohorts` | `/Cohorts` |  |
| `Community` | `/community` | `/Community` | vaultOnly |
| `CourseDetail` | `/coursedetail` | `/CourseDetail` | hidden |
| `CourseSales` | `/coursesales` | `/CourseSales` | hidden |
| `Courses` | `/courses` | `/Courses` |  |
| `Dashboard` | `/dashboard` | `/Dashboard` |  |
| `Downloads` | `/downloads` | `/Downloads` | vaultOnly |
| `Events` | `/events` | `/Events` | vaultOnly |
| `Feed` | `/feed` | `/Feed` |  |
| `Forums` | `/forums` | `/Forums` | vaultOnly |
| `HabitTracker` | `/habittracker` | `/HabitTracker` | vaultOnly |
| `Integrations` | `/integrations` | `/Integrations` |  |
| `Integrity` | `/integrity` | `/Integrity` | vaultOnly |
| `InviteAccept` | `/inviteaccept` | `/InviteAccept` | hidden |
| `LanguageLearning` | `/languagelearning` | `/LanguageLearning` |  |
| `Languages` | `/languages` | `/Languages` | vaultOnly |
| `Leaderboard` | `/leaderboard` | `/Leaderboard` | vaultOnly |
| `LearningPaths` | `/learningpaths` | `/LearningPaths` | vaultOnly |
| `LegacyMigration` | `/legacymigration` | `/LegacyMigration` | vaultOnly |
| `LessonViewer` | `/lessonviewer` | `/LessonViewer` | hidden |
| `LessonViewerPremium` | `/lessonviewerpremium` | `/LessonViewerPremium` | hidden |
| `LiveStreams` | `/livestreams` | `/LiveStreams` | vaultOnly |
| `Marketplace` | `/marketplace` | `/Marketplace` | vaultOnly |
| `Mentorship` | `/mentorship` | `/Mentorship` | vaultOnly |
| `Messages` | `/messages` | `/Messages` | vaultOnly |
| `Microlearning` | `/microlearning` | `/Microlearning` | vaultOnly |
| `MyProgress` | `/myprogress` | `/MyProgress` | vaultOnly |
| `MyQuizzes` | `/my-quizzes` | `/MyQuizzes` |  |
| `NetworkAdmin` | `/networkadmin` | `/NetworkAdmin` | vaultOnly |
| `Offline` | `/offline` | `/Offline` |  |
| `Portfolio` | `/portfolio` | `/Portfolio` |  |
| `QuizTake` | `` | `/QuizTake` | not in feature registry |
| `Reader` | `/reader` | `/Reader` |  |
| `RewardsShop` | `/rewardsshop` | `/RewardsShop` | vaultOnly |
| `Scholarships` | `/scholarships` | `/Scholarships` | vaultOnly |
| `SchoolAdmin` | `/schooladmin` | `/SchoolAdmin` |  |
| `SchoolAnalytics` | `/schoolanalytics` | `/SchoolAnalytics` |  |
| `SchoolCheckout` | `/schoolcheckout` | `/SchoolCheckout` | hidden |
| `SchoolCourses` | `/schoolcourses` | `/SchoolCourses` |  |
| `SchoolJoin` | `/schooljoin` | `/SchoolJoin` | hidden |
| `SchoolLanding` | `/schoollanding` | `/SchoolLanding` |  |
| `SchoolMonetization` | `/schoolmonetization` | `/SchoolMonetization` |  |
| `SchoolNew` | `/schoolnew` | `/SchoolNew` | hidden |
| `SchoolPricing` | `/schoolpricing` | `/SchoolPricing` | hidden |
| `SchoolSearch` | `/schoolsearch` | `/SchoolSearch` |  |
| `SchoolSelect` | `/schoolselect` | `/SchoolSelect` | hidden |
| `SchoolStaff` | `/schoolstaff` | `/SchoolStaff` | vaultOnly |
| `SchoolThankYou` | `/schoolthankyou` | `/SchoolThankYou` | hidden |
| `Skills` | `/skills` | `/Skills` | vaultOnly |
| `StudyBuddies` | `/studybuddies` | `/StudyBuddies` | vaultOnly |
| `StudySet` | `/studyset` | `/StudySet` | hidden |
| `StudySetNew` | `/studysetnew` | `/StudySetNew` | hidden |
| `StudySetPractice` | `/studysetpractice` | `/StudySetPractice` | hidden |
| `StudySets` | `/studysets` | `/StudySets` |  |
| `Subscription` | `/subscription` | `/Subscription` | hidden |
| `Teach` | `/teach` | `/Teach` |  |
| `TeachAnalytics` | `/teachanalytics` | `/TeachAnalytics` |  |
| `TeachCourse` | `/teachcourse` | `/TeachCourse` | hidden |
| `TeachCourseNew` | `/teachcoursenew` | `/TeachCourseNew` | hidden |
| `TeachLesson` | `/teachlesson` | `/TeachLesson` | hidden |
| `TeachQuizEditor` | `` | `/TeachQuizEditor` | not in feature registry |
| `TeachQuizzes` | `/teach/quizzes` | `/TeachQuizzes` |  |
| `Tournaments` | `/tournaments` | `/Tournaments` | vaultOnly |
| `Vault` | `/vault` | `/Vault` |  |
| `oauth2callback` | `/oauth2callback` | `/oauth2callback` | hidden |

---

## Important routing implication for the “new portal split”
Because the current router depends on:
- `/{PageKey}` and `/:pageName`

…we must add new portal routes **without breaking** these.

Recommended approach:
- Add explicit route groups:
  - `/student/*`
  - `/teacher/*`
  - `/admin/*`
  - `/superadmin/*`
- Keep existing routes working forever (or alias them to the new groups).
