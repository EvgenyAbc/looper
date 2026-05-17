import { createContext, useContext } from 'react';

import type { AppConfig } from './types';

const AppConfigContext = createContext<AppConfig | null>(null);

function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('useAppConfig must be used within AppConfigProvider');
  return ctx;
}

export { AppConfigContext, useAppConfig };
export type { AppConfig };
