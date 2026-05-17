import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';

/**
 * If you add a subnav with `NavLink` under a host splat route (`/appX/*`), build `to` from
 * `useLeafPathnameBase()` + `joinRemotePath()` from `@looper/shared` — not relative `to="child"`.
 */
export default function RemoteRootApp() {
  return (
    <div className="__REMOTE_NAME__-root">
      <Routes>
        <Route index element={<HomePage />} />
      </Routes>
    </div>
  );
}
