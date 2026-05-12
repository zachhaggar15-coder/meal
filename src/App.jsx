import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import MealPlanPage from './pages/MealPlanPage.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Stickers from './pages/Stickers.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="layout-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meal-plan/:slug" element={<MealPlanPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/stickers" element={<Stickers />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
