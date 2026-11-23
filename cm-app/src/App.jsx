import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
// import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Estimates from './pages/Estimates';
import Team from './pages/Team';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Activity from './pages/Activity';
import Loader from './components/Loader';
import {useAuth} from './context/AuthContext';
import { useApp } from './context/AppContext';

const TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/workers': 'Workers',
  '/estimates': 'Estimates',
  '/team': 'Team',
  '/reports': 'Reports',
  '/activity': 'Activity log',
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Project details';
  const {user, loading, logout} = useAuth();
  const { loading: dataLoading, loadError, error, clearError } = useApp();
  // Password reset link from email: works whether or not someone is signed in.
  if (location.pathname === '/auth/action') return <ResetPassword />;
  if (loading) return <Loader />;
  if(!user) return <Login />;
  if (loadError) {
    // Can't read this account's data (e.g. Firestore rules deny it): nothing to show, so offer sign-out.
    return (
      <div className="login">
        <div className="login__card form">
          <div className="login__brand">
            <img className="login__logo" src="/logo-full.png" alt="Malganga Constructions" />
          </div>
          <div className="form__error" role="alert">{loadError}</div>
          <p className="muted">Signed in as {user.email}</p>
          <button className="btn btn--primary" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }
  if (dataLoading) return <Loader label="Loading project data" />;
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <div className="app-shell__main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="app-shell__content">
          {error && (
            <div className="form__error app-error" role="alert">
              <span>{error}</span>
              <button className="icon-btn" onClick={clearError} aria-label="Dismiss">&times;</button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            {/* Workers section disabled for now */}
            {/* <Route path="/workers" element={<Workers />} /> */}
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/team" element={<Team />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity" element={<Activity />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
