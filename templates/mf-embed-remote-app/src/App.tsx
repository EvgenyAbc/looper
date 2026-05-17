import { Routes, Route } from 'react-router';
import { useEmbedRelativeLocation } from '@looper/shared';
import { EmbedLayout } from './EmbedLayout';
import PageA from './pages/PageA';
import PageB from './pages/PageB';

/**
 * Embed remote: mounted inside a parent route (e.g. parent `path="app4/*"`).
 * Subnav uses `useLeafPathnameBase()` (innermost splat) + `joinRemotePath`.
 */
export default function EmbedRemoteApp() {
  const relativeLocation = useEmbedRelativeLocation();

  return (
    <Routes location={relativeLocation}>
      <Route element={<EmbedLayout />}>
        <Route index element={<PageA />} />
        <Route path="page-b" element={<PageB />} />
      </Route>
    </Routes>
  );
}
