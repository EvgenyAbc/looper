/* ── User types ── */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

/* ── Theme types ── */
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

/* ── App config types (mocked router data) ── */
export type AppDisplayMode = 'page' | 'widget';

export interface AppMenuItem {
  id: string;
  name: string;
  entry: string;
  /** Required for `displayMode: 'page'` routes and sidebar links. */
  route?: string;
  module?: string;
  icon?: string;
  features?: string[];
  permissions?: string[];
  /** MF container name in `init()` / `loadRemote`; defaults to `id`. */
  remoteName?: string;
  displayMode?: AppDisplayMode;
  /** Shell slot id when `displayMode` is `widget` (e.g. `home`). */
  widgetSlot?: string;
}

/** MF runtime remote name (ModuleFederation `name` / `loadRemote` prefix). */
export function appMfContainerName(app: AppMenuItem): string {
  return app.remoteName ?? app.id;
}

export function isAppPage(app: AppMenuItem): boolean {
  return app.displayMode !== 'widget';
}

export interface AppConfig {
  apps: AppMenuItem[];
  system?: AppMenuItem[];
  shared: { id: string; entry: string };
  features: Record<string, boolean>;
  endpoints: Record<string, string>;
}

/* ── Counter context (context-sharing E2E verification) ── */
export interface CounterContextValue {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

/* ── Button types ── */
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
