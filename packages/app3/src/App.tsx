import { Route,Routes } from 'react-router';

import HomePage from './pages/HomePage';

import styles from './App.module.css';

export default function RemoteRootApp() {
  return (
    <div className={styles.chrome} data-testid="app3-remote-shell">
      <Routes>
        <Route index element={<HomePage />} />
      </Routes>
    </div>
  );
}
