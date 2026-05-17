import { NavLink } from 'react-router';

import { type AppMenuItem,useAuth, useTheme } from '@looper/shared';

interface SidebarProps {
  apps: AppMenuItem[];
}

export function Sidebar({ apps }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  return (
    <aside className="sidebar" data-testid="shell-sidebar">
      <header className="sidebar-header" data-testid="shell-sidebar-brand">
        <h2>Looper</h2>
        <span className="version-badge">MF 2.0</span>
      </header>

      <nav className="sidebar-nav" aria-label="Main" data-testid="shell-sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="sidebar-app-marker">H</span>
          Home
        </NavLink>

        <div className="nav-section-label">Applications</div>
        {apps.map((app) => (
          <NavLink
            key={app.id}
            to={(app.route ?? '').replace('/*', '')}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="sidebar-app-marker">{app.name.trim().charAt(0).toUpperCase()}</span>
            {app.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="user-info">
            <span className="user-avatar">{user?.username?.charAt(0).toUpperCase() || '?'}</span>
            <span className="user-name">{user?.username || 'User'}</span>
          </div>
        ) : (
          <NavLink to="/login" className="nav-link">Sign in</NavLink>
        )}
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>
    </aside>
  );
}
