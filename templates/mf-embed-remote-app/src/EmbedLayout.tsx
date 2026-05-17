import { NavLink, Outlet } from 'react-router';
import { joinRemotePath, useLeafPathnameBase } from '@looper/shared';
import styles from './App.module.css';

function subNavLinkClass({ isActive }: { isActive: boolean }) {
  return `remote-subnav__link${isActive ? ' active' : ''}`;
}

export function EmbedLayout() {
  const base = useLeafPathnameBase();

  return (
    <div className={`__REMOTE_NAME__-root ${styles.chrome}`} data-testid="__REMOTE_NAME__-remote-shell">
      <nav className="remote-subnav" aria-label="__DISPLAY_NAME__ sections">
        <NavLink to={base} end className={subNavLinkClass}>
          Page A
        </NavLink>
        <NavLink to={joinRemotePath(base, 'page-b')} className={subNavLinkClass}>
          Page B
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
