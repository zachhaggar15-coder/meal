import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner.jsx';
import BehaviorAnalytics from './components/BehaviorAnalytics.jsx';
import ClickTracking from './components/ClickTracking.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { trackPageView } from './utils/analytics.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const MealPlanPage = lazy(() => import('./pages/MealPlanPage.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const QuestionsHub = lazy(() => import('./pages/QuestionsHub.jsx'));
const AccessoriesHub = lazy(() => import('./pages/AccessoriesHub.jsx'));
const ContainerHub = lazy(() => import('./pages/ContainerHub.jsx'));
const ContainerGuide = lazy(() => import('./pages/ContainerGuide.jsx'));
const Stickers = lazy(() => import('./pages/Stickers.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const QuizResults = lazy(() => import('./pages/QuizResults.jsx'));
const PlanPage = lazy(() => import('./pages/PlanPage.jsx'));
const PlanChooserPage = lazy(() => import('./pages/PlanChooserPage.jsx'));
const ChoiceLandingPage = lazy(() => import('./pages/ChoiceLandingPage.jsx'));
const BrowsePlans = lazy(() => import('./pages/BrowsePlans.jsx'));
const MealPlanHubPage = lazy(() => import('./pages/MealPlanHubPage.jsx'));
const ToolsPage = lazy(() => import('./pages/ToolsPage.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Feedback = lazy(() => import('./pages/Feedback.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const SupermarketIndexPage = lazy(() => import('./pages/SupermarketIndexPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Strip tracking query params from the homepage so Google indexes the clean URL
function StripHomeParams() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/' && window.location.search) {
      window.history.replaceState(null, '', '/');
    }
  }, [pathname]);
  return null;
}

function AnalyticsRouteTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);
  return null;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <BehaviorAnalytics />
      <ClickTracking />
      <AnalyticsRouteTracker />
      <ScrollToTop />
      <StripHomeParams />
      <Navbar menuOpen={sidebarOpen} onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main id="main-content" className="layout-main" tabIndex="-1">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz/results" element={<QuizResults />} />
              <Route path="/choose-plan/:goal" element={<PlanChooserPage />} />
              <Route path="/choose-supermarket/:supermarket" element={<ChoiceLandingPage mode="supermarket" />} />
              <Route path="/choose-diet/:diet" element={<ChoiceLandingPage mode="diet" />} />
              <Route path="/choose-calories/:calories" element={<ChoiceLandingPage mode="calories" />} />
              <Route path="/plans/:slug" element={<PlanPage />} />
              <Route path="/browse" element={<BrowsePlans />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/meal-plans" element={<SupermarketIndexPage />} />
              <Route path="/meal-plans/:slug" element={<MealPlanHubPage />} />
              <Route path="/meal-plan/:slug" element={<MealPlanPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/questions" element={<QuestionsHub />} />
              <Route path="/meal-prep-accessories" element={<AccessoriesHub />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/meal-prep-containers" element={<ContainerHub />} />
              <Route path="/meal-prep-containers/:tier" element={<ContainerGuide />} />
              <Route path="/stickers" element={<Stickers />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <AnalyticsConsentBanner />
    </>
  );
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      Loading...
    </div>
  );
}
