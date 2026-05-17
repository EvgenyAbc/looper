# Mount app4 inside a parent remote

Parent must run under the shell (MF runtime-core on host). Register and load at runtime:

```tsx
import { Suspense } from 'react';
import { FederatedMount, joinRemotePath, useLeafPathnameBase } from '@looper/shared';

const APP4 = {
  remoteName: 'app4',
  entry: 'http://localhost:3005/remoteEntry.js',
} as const;

// In parent Routes:
<Route
  path="app4/*"
  element={
    <Suspense fallback={<div className="remote-loading">Loading App four…</div>}>
      <FederatedMount
        remoteName={APP4.remoteName}
        entry={APP4.entry}
        modulePath="./App"
      />
    </Suspense>
  }
/>

// Parent subnav (outermost splat — avoids /app2/app4/app4 when already inside embed):
<NavLink to={joinRemotePath(useLeafPathnameBase({ scope: 'outermost' }), 'app4')}>App four</NavLink>
```

URLs when parent is at `/app2/*`: `/app2/app4`, `/app2/app4/form`, `/app2/app4/components`, `/app2/app4/ui-kit`, `/app2/app4/modal`.
