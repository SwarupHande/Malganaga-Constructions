import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Estimates from './pages/Estimates';

const TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/workers': 'Workers',
  '/estimates': 'Estimates',
  '/reports': 'Reports',
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Project details';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <div className="app-shell__main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="app-shell__content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
