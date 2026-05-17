import { NavLink, Route,Routes } from 'react-router';

import { joinRemotePath, useLeafPathnameBase } from '@looper/shared';

import AnalyticsPage from './pages/AnalyticsPage';
import DashboardPage from './pages/DashboardPage';

import styles from './App.module.css';

function subNavLinkClass({ isActive }: { isActive: boolean }) {
  return `remote-subnav__link${isActive ? ' active' : ''}`;
}

/**
 * Nested route tree for app1. Shell mounts at `/app1/*` — subnav must use splat pathnameBase,
 * not relative `to="analytics"` (see `useLeafPathnameBase` in @looper/shared).
 */
export default function App1App() {
  const base = useLeafPathnameBase();

  return (
    <div className={`app1-root ${styles.chrome}`} data-testid="app1-remote-shell">
      <nav className="remote-subnav" aria-label="App 1 sections">
        <NavLink to={base} end className={subNavLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to={joinRemotePath(base, 'analytics')} className={subNavLinkClass}>
          Analytics
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Routes>
    </div>
  );
}

export { AnalyticsPage,DashboardPage };
