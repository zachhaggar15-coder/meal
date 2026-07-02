import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ClickTracking from './components/ClickTracking.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import MealPlanPage from './pages/MealPlanPage.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import ContainerHub from './pages/ContainerHub.jsx';
import ContainerGuide from './pages/ContainerGuide.jsx';
import Stickers from './pages/Stickers.jsx';
import Quiz from './pages/Quiz.jsx';
import QuizResults from './pages/QuizResults.jsx';
import PlanPage from './pages/PlanPage.jsx';
import PlanChooserPage from './pages/PlanChooserPage.jsx';
import ChoiceLandingPage from './pages/ChoiceLandingPage.jsx';
import BrowsePlans from './pages/BrowsePlans.jsx';
import MealPlanHubPage from './pages/MealPlanHubPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import SupermarketIndexPage from './pages/SupermarketIndexPage.jsx';
import NotFound from './pages/NotFound.jsx';

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

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ClickTracking />
      <ScrollToTop />
      <StripHomeParams />
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="layout-main">
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
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/meal-plans" element={<SupermarketIndexPage />} />
            <Route path="/meal-plans/:slug" element={<MealPlanHubPage />} />
            <Route path="/meal-plan/:slug" element={<MealPlanPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/meal-prep-containers" element={<ContainerHub />} />
            <Route path="/meal-prep-containers/:tier" element={<ContainerGuide />} />
            <Route path="/stickers" element={<Stickers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
