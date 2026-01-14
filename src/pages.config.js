import React from 'react';

import Achievements from './pages/Achievements';
import AdaptiveLearning from './pages/AdaptiveLearning';
import AdminHardening from './pages/AdminHardening';
import Affiliate from './pages/Affiliate';
import AffiliateProgram from './pages/AffiliateProgram';
import AlumniNetwork from './pages/AlumniNetwork';
import Analytics from './pages/Analytics';
import CareerPaths from './pages/CareerPaths';
import Challenges from './pages/Challenges';
import CohortDetail from './pages/CohortDetail';
import Cohorts from './pages/Cohorts';
import Community from './pages/Community';
import CourseDetail from './pages/CourseDetail';
import CourseSales from './pages/CourseSales';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Feed from './pages/Feed';
import Forums from './pages/Forums';
import HabitTracker from './pages/HabitTracker';
import Integrations from './pages/Integrations';
import LanguageLearning from './pages/LanguageLearning';
import Languages from './pages/Languages';
import Leaderboard from './pages/Leaderboard';
import LearningPaths from './pages/LearningPaths';
import LegacyMigration from './pages/LegacyMigration';
import LessonViewer from './pages/LessonViewer';
import LessonViewerPremium from './pages/LessonViewerPremium';
import LiveStreams from './pages/LiveStreams';
import Marketplace from './pages/Marketplace';
import Mentorship from './pages/Mentorship';
import Messages from './pages/Messages';
import Microlearning from './pages/Microlearning';
import MyProgress from './pages/MyProgress';
import Offline from './pages/Offline';
import Portfolio from './pages/Portfolio';
import Reader from './pages/Reader';
import RewardsShop from './pages/RewardsShop';
import Scholarships from './pages/Scholarships';
import SchoolAdmin from './pages/SchoolAdmin';
import SchoolAnalytics from './pages/SchoolAnalytics';
import SchoolCheckout from './pages/SchoolCheckout';
import SchoolCourses from './pages/SchoolCourses';
import SchoolJoin from './pages/SchoolJoin';
import SchoolLanding from './pages/SchoolLanding';
import SchoolNew from './pages/SchoolNew';
import SchoolPricing from './pages/SchoolPricing';
import SchoolSelect from './pages/SchoolSelect';
import SchoolThankYou from './pages/SchoolThankYou';
import Skills from './pages/Skills';
import StudyBuddies from './pages/StudyBuddies';
import StudySet from './pages/StudySet';
import StudySetNew from './pages/StudySetNew';
import StudySetPractice from './pages/StudySetPractice';
import StudySets from './pages/StudySets';
import Subscription from './pages/Subscription';
import Teach from './pages/Teach';
import TeachAnalytics from './pages/TeachAnalytics';
import TeachCourse from './pages/TeachCourse';
import TeachCourseNew from './pages/TeachCourseNew';
import TeachLesson from './pages/TeachLesson';
import TeachQuizzes from './pages/TeachQuizzes';
import TeachQuizEditor from './pages/TeachQuizEditor';
import QuizTake from './pages/QuizTake';
import MyQuizzes from './pages/MyQuizzes';
import Tournaments from './pages/Tournaments';
import oauth2callback from './pages/oauth2callback';
import CertificateVerify from './pages/CertificateVerify';
import SchoolStaff from './pages/SchoolStaff';
import InviteAccept from './pages/InviteAccept';
import AuditLogViewer from './pages/AuditLogViewer';
import __Layout from './Layout.jsx';

// Lazy-loaded heavy routes (v8.6 perf)
const Downloads = React.lazy(() => import('./pages/Downloads'));
const Integrity = React.lazy(() => import('./pages/Integrity'));
const SchoolMonetization = React.lazy(() => import('./pages/SchoolMonetization'));
const SchoolSearch = React.lazy(() => import('./pages/SchoolSearch'));
const Vault = React.lazy(() => import('./pages/Vault'));
const Account = React.lazy(() => import('./pages/Account'));
const NetworkAdmin = React.lazy(() => import('./pages/NetworkAdmin'));


export const PAGES = {
    "Achievements": Achievements,
    "AdaptiveLearning": AdaptiveLearning,
    "AdminHardening": AdminHardening,
    "Affiliate": Affiliate,
    "AffiliateProgram": AffiliateProgram,
    "AlumniNetwork": AlumniNetwork,
    "Analytics": Analytics,
    "CareerPaths": CareerPaths,
    "Challenges": Challenges,
    "CohortDetail": CohortDetail,
    "Cohorts": Cohorts,
    "Community": Community,
    "CourseDetail": CourseDetail,
    "CourseSales": CourseSales,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "Downloads": Downloads,
    "Events": Events,
    "Feed": Feed,
    "Forums": Forums,
    "HabitTracker": HabitTracker,
    "Integrations": Integrations,
    "Integrity": Integrity,
    "LanguageLearning": LanguageLearning,
    "Languages": Languages,
    "Leaderboard": Leaderboard,
    "LearningPaths": LearningPaths,
    "LegacyMigration": LegacyMigration,
    "LessonViewer": LessonViewer,
    "LessonViewerPremium": LessonViewerPremium,
    "LiveStreams": LiveStreams,
    "Marketplace": Marketplace,
    "Mentorship": Mentorship,
    "Messages": Messages,
    "Microlearning": Microlearning,
    "MyProgress": MyProgress,
    "Offline": Offline,
    "Portfolio": Portfolio,
    "Reader": Reader,
    "RewardsShop": RewardsShop,
    "Scholarships": Scholarships,
    "SchoolAdmin": SchoolAdmin,
    "SchoolAnalytics": SchoolAnalytics,
    "SchoolCheckout": SchoolCheckout,
    "SchoolCourses": SchoolCourses,
    "SchoolJoin": SchoolJoin,
    "SchoolLanding": SchoolLanding,
    "SchoolMonetization": SchoolMonetization,
    "SchoolNew": SchoolNew,
    "SchoolPricing": SchoolPricing,
    "SchoolSearch": SchoolSearch,
    "SchoolSelect": SchoolSelect,
    "SchoolThankYou": SchoolThankYou,
    "Skills": Skills,
    "StudyBuddies": StudyBuddies,
    "StudySet": StudySet,
    "StudySetNew": StudySetNew,
    "StudySetPractice": StudySetPractice,
    "StudySets": StudySets,
    "Subscription": Subscription,
    "Teach": Teach,
    "TeachAnalytics": TeachAnalytics,
    "TeachCourse": TeachCourse,
    "TeachCourseNew": TeachCourseNew,
    "TeachLesson": TeachLesson,
    "TeachQuizzes": TeachQuizzes,
    "TeachQuizEditor": TeachQuizEditor,
    "QuizTake": QuizTake,
    "MyQuizzes": MyQuizzes,
    "Tournaments": Tournaments,
    "Vault": Vault,
    "oauth2callback": oauth2callback,
    "Account": Account,
    "NetworkAdmin": NetworkAdmin,
    "CertificateVerify": CertificateVerify,
    "SchoolStaff": SchoolStaff,
    "InviteAccept": InviteAccept,
    "AuditLogViewer": AuditLogViewer,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
