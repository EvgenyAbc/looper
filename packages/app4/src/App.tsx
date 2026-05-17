import { Route,Routes } from 'react-router';

import { useEmbedRelativeLocation } from '@looper/shared';

import { EmbedLayout } from './EmbedLayout';
import ComponentsShowcase from './pages/ComponentsShowcase';
import Dashboard from './pages/Dashboard';
import FormPage from './pages/FormPage';
import ModalDemo from './pages/ModalDemo';
import UIKitDemo from './pages/UIKitDemo';

/**
 * Embed remote: mounted inside a parent route (e.g. parent `path="app4/*"`).
 * Subnav uses `useLeafPathnameBase()` (innermost splat) + `joinRemotePath`.
 */
export default function EmbedRemoteApp() {
  const relativeLocation = useEmbedRelativeLocation();

  return (
    <Routes location={relativeLocation}>
      <Route element={<EmbedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="form" element={<FormPage />} />
        <Route path="components" element={<ComponentsShowcase />} />
        <Route path="ui-kit" element={<UIKitDemo />} />
        <Route path="modal" element={<ModalDemo />} />
      </Route>
    </Routes>
  );
}
