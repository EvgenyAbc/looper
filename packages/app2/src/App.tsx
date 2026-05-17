import { NavLink, Route,Routes } from 'react-router';

import {
  FederatedApp,
  joinRemotePath,
  useEmbedRelativeLocation,
  useLeafPathnameBase,
} from '@looper/shared';

import { APP4_REMOTE } from './embedded/app4';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import styles from './App.module.css';

function subNavLinkClass({ isActive }: { isActive: boolean }) {
  return `remote-subnav__link${isActive ? ' active' : ''}`;
}

/**
 * Shell mounts remote at `/appX/*`. Use outermost splat base so subnav stays correct
 * when an embed (app4) adds a nested splat under this remote.
 */
export default function App2App() {
  const base = useLeafPathnameBase({ scope: 'outermost' });
  const relativeLocation = useEmbedRelativeLocation({ scope: 'outermost' });

  return (
    <div className={`app2-root ${styles.chrome}`} data-testid="app2-remote-shell">
      <nav className="remote-subnav" aria-label="App 2 sections">
        <NavLink to={base} end className={subNavLinkClass}>
          Profile
        </NavLink>
        <NavLink to={joinRemotePath(base, 'settings')} className={subNavLinkClass}>
          Settings
        </NavLink>
        <NavLink to={joinRemotePath(base, APP4_REMOTE.mountSegment)} className={subNavLinkClass}>
          App four
        </NavLink>
      </nav>
      <Routes location={relativeLocation}>
        <Route index element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path={`${APP4_REMOTE.mountSegment}/*`} element={<FederatedApp config={APP4_REMOTE} />} />
      </Routes>
    </div>
  );
}

export { ProfilePage,SettingsPage };
