export { AppConfigContext, useAppConfig } from './AppConfigContext';
export { AuthContext, AuthProvider, useAuth } from './AuthContext';
export { Button, default as ButtonDefault } from './Button';
export { CounterContext, CounterProvider, useCounter } from './CounterContext';
export { FederatedApp, type FederatedAppProps,type FederatedEmbedConfig } from './FederatedApp';
export { FederatedMount, type FederatedMountProps } from './FederatedMount';
export {
  looperDebug,
  looperDebugEmbedLoaded,
  looperDebugPageReady,
  looperDebugRemoteLoaded,
  looperDebugShellReady,
} from './looperDebug';
export { RemoteMountBaseProvider, useRemoteMountBase } from './RemoteMountBaseContext';
export { RemoteSplatProvider, useRemoteSplat } from './RemoteSplatContext';
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
export type {
  AppConfig, AppDisplayMode,
AppMenuItem, AuthContextValue, AuthState,   ButtonProps,
CounterContextValue,
LoginCredentials,
ThemeContextValue,   ThemeMode,   User, } from './types';
export { appMfContainerName, isAppPage } from './types';
export {
  menuRemoteBaseFromPath,
  resolveEmbedRoutesPathname,
  useEmbedRelativeLocation,
} from './useEmbedRelativeLocation';
export {
  joinRemotePath,
  type LeafPathnameScope,
  useLeafPathnameBase,
  type UseLeafPathnameBaseOptions,
} from './useLeafPathnameBase';

// re‑export ui‑looper helpers for convenience
export {
  loadUILooperStyles,
  UIBadge,
  UIButton,
  UICard,
  UICardBody,
  UICardFooter,
  UICardHeader,
  UIContainer,
  UIHeading,
  UIInput,
  UIModal,
  UISelect,
  UISpinner,
  UITag,
  UIText,
  UIToastProvider,
  UITooltip,
  useUILooperComponent,
} from './uiLooper';
export type {
  UIBadgeProps,
  UIButtonProps,
  UICardBodyProps,
  UICardFooterProps,
  UICardHeaderProps,
  UICardProps,
  UIHeadingProps,
  UIInputProps,
  UIModalProps,
  UISelectGroup,
  UISelectOption,
  UISelectProps,
  UISpinnerProps,
  UITagProps,
  UITextProps,
  UIToastOptions,
  UIToastProviderProps,
  UITooltipProps,
} from './uiLooper.types';
