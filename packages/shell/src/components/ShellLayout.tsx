import { Outlet } from 'react-router';

import { isAppPage,useAppConfig } from '@looper/shared';

import { Sidebar } from './Sidebar';

export function ShellLayout() {
  const { apps } = useAppConfig();
  const pageApps = apps.filter((a) => isAppPage(a) && Boolean(a.route));

  return (
    <div className="shell-layout">
      <Sidebar apps={pageApps} />
      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  );
}
