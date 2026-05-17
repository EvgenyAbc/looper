import { NavLink, Outlet } from 'react-router';

import { joinRemotePath, useLeafPathnameBase } from '@looper/shared';

import styles from './App.module.css';

function subNavLinkClass({ isActive }: { isActive: boolean }) {
  return `remote-subnav__link${isActive ? ' active' : ''}`;
}

const LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '', label: 'Dashboard', end: true },
  { to: 'form', label: 'Form' },
  { to: 'components', label: 'Components' },
  { to: 'ui-kit', label: 'UI Kit' },
  { to: 'modal', label: 'Modal' },
];

export function EmbedLayout() {
  const base = useLeafPathnameBase();

  return (
    <div className={`app4-root ${styles.chrome}`} data-testid="app4-remote-shell">
      <nav className="remote-subnav" aria-label="App four sections">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to === '' ? base : joinRemotePath(base, link.to)}
            end={link.end}
            className={subNavLinkClass}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
