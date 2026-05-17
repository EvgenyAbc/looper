import type { AppConfig } from '@looper/shared';

import { loadShellRuntime } from './shellRuntime';

export async function shellConfigLoader(): Promise<AppConfig> {
  return loadShellRuntime();
}
