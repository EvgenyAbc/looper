/**
 * uiLooper.ts — утилиты для загрузки компонентов и стилей @ui-looper/core
 * через Module Federation 2.0 runtime.
 *
 * Использование в компоненте:
 * ```tsx
 * import { UIContainer, UIButton, UICard } from '@looper/shared';
 *
 * function MyPage() {
 *   return (
 *     <UIContainer>
 *       <UIButton variant="primary">Save</UIButton>
 *       <UICard>
 *         <UICard.Header>Title</UICard.Header>
 *         <UICard.Body>Content</UICard.Body>
 *       </UICard>
 *     </UIContainer>
 *   );
 * }
 * ```
 *
 * Или напрямую через хук:
 * ```tsx
 * import { useUILooperComponent } from '@looper/shared';
 *
 * function MyButton(props: any) {
 *   const Button = useUILooperComponent('./Button');
 *   if (!Button) return null;
 *   return <Button.default {...props} />;
 * }
 * ```
 */
import { type ComponentType, type ReactNode,Suspense, use, useMemo } from 'react';
import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

import type {
  UIBadgeProps,
  UIButtonProps,
  UICardBodyProps,
  UICardFooterProps,
  UICardHeaderProps,
  UICardProps,
  UIHeadingProps,
  UIInputProps,
  UIModalProps,
  UISelectProps,
  UISpinnerProps,
  UITagProps,
  UITextProps,
  UIToastOptions,
  UIToastProviderProps,
  UITooltipProps,
} from './uiLooper.types';

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

// ── Конфигурация remote ─────────────────────────────────────

const REMOTE_NAME = 'ui_looper' as const;
/** GitHub Pages CDN — never localhost:3030 */
const UI_LOOPER_ENTRY =
  'https://evgenyabc.github.io/ui-looper/v1.0.0/remoteEntry.js';

let remoteRegistered = false;

export async function ensureUiLooperRemote(): Promise<boolean> {
  if (remoteRegistered) return true;
  registerRemotes([{ name: REMOTE_NAME, entry: UI_LOOPER_ENTRY, alias: REMOTE_NAME }]);
  remoteRegistered = true;
  return true;
}

// ── Загрузка стилей ─────────────────────────────────────────

let stylesLoaded = false;

/**
 * Загружает дизайн-токены и базовые стили @ui-looper/core через MF runtime.
 */
export async function loadUILooperStyles(): Promise<void> {
  if (stylesLoaded) return;
  if (!(await ensureUiLooperRemote())) return;
  stylesLoaded = true;

  try {
    await Promise.all([
      loadRemote(`${REMOTE_NAME}/styles/tokens.css`),
      loadRemote(`${REMOTE_NAME}/styles/primitives.css`),
    ]);
    if (process.env.NODE_ENV === 'development') {
      console.log('[ui-looper] Styles loaded');
    }
  } catch (err) {
    console.warn('[ui-looper] Failed to load styles from CDN:', err);
    stylesLoaded = false;
  }
}

function loadUiModule<T>(modulePath: string): Promise<{ default: T } | null> {
  const key = modulePath.replace(/^\.\//, '');
  return ensureUiLooperRemote()
    .then((ok) => (ok ? loadRemote<{ default: T }>(`${REMOTE_NAME}/${key}`) : null))
    .catch((err) => {
      console.warn(`[ui-looper] Failed to load ${modulePath}:`, err);
      return null;
    });
}

// ── Хук для загрузки компонента ─────────────────────────────

/**
 * React-хук для загрузки компонента из @ui-looper/core.
 *
 * @param modulePath — путь к модулю (expose key), e.g. './Button'
 * @returns модуль с default-экспортом компонента, или null в процессе загрузки
 */
export function useUILooperComponent<T = ComponentType<unknown>>(
  modulePath: string,
): { default: T } | null {
  const loadPromise = useMemo(() => loadUiModule<T>(modulePath), [modulePath]);
  return use(loadPromise);
}

// ── Готовые компоненты-обёртки ──────────────────────────────

// ── Button ──
export function UIButton(props: UIButtonProps) {
  const Comp = useUILooperComponent<ComponentType<UIButtonProps>>('./Button');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Badge ──
export function UIBadge(props: UIBadgeProps) {
  const Comp = useUILooperComponent<ComponentType<UIBadgeProps>>('./Badge');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

type CardModule = ComponentType<UICardProps> & {
  Header: ComponentType<UICardHeaderProps>;
  Body: ComponentType<UICardBodyProps>;
  Footer: ComponentType<UICardFooterProps>;
};

// ── Card ──
export function UICard(props: UICardProps) {
  const Comp = useUILooperComponent<CardModule>('./Card');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

export function UICardHeader(props: UICardHeaderProps) {
  const Comp = useUILooperComponent<CardModule>('./Card');
  if (!Comp) return null;
  return <Comp.default.Header {...props} />;
}

export function UICardBody(props: UICardBodyProps) {
  const Comp = useUILooperComponent<CardModule>('./Card');
  if (!Comp) return null;
  return <Comp.default.Body {...props} />;
}

export function UICardFooter(props: UICardFooterProps) {
  const Comp = useUILooperComponent<CardModule>('./Card');
  if (!Comp) return null;
  return <Comp.default.Footer {...props} />;
}

// ── Input ──
export function UIInput(props: UIInputProps) {
  const Comp = useUILooperComponent<ComponentType<UIInputProps>>('./Input');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Select ──
export function UISelect(props: UISelectProps) {
  const Comp = useUILooperComponent<ComponentType<UISelectProps>>('./Select');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Tag ──
export function UITag(props: UITagProps) {
  const Comp = useUILooperComponent<ComponentType<UITagProps>>('./Tag');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Spinner ──
export function UISpinner(props: UISpinnerProps) {
  const Comp = useUILooperComponent<ComponentType<UISpinnerProps>>('./Spinner');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Tooltip ──
export function UITooltip(props: UITooltipProps) {
  const Comp = useUILooperComponent<ComponentType<UITooltipProps>>('./Tooltip');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Text ──
export function UIText(props: UITextProps) {
  const Comp = useUILooperComponent<ComponentType<UITextProps>>('./Text');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Heading ──
export function UIHeading(props: UIHeadingProps) {
  const Comp = useUILooperComponent<ComponentType<UIHeadingProps>>('./Heading');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Modal ──
export function UIModal(props: UIModalProps) {
  const Comp = useUILooperComponent<ComponentType<UIModalProps>>('./Modal');
  if (!Comp) return null;
  return <Comp.default {...props} />;
}

// ── Toast (Provider + hook) ──

/**
 * Toast provider — must be mounted near the root to use useUIToast.
 * Wraps @ui-looper/core ToastProvider.
 */
export function UIToastProvider({ children, position = 'top-right' }: UIToastProviderProps) {
  const Comp = useUILooperComponent<ComponentType<UIToastProviderProps>>('./Toast');
  if (!Comp) return <>{children}</>;
  return <Comp.default position={position}>{children}</Comp.default>;
}

/**
 * Хук для показа тостов. Возвращает { toast: (options: UIToastOptions) => string }.
 * Должен вызываться внутри UIToastProvider (или ToastProvider из ui-looper).
 */
export function useUIToast(): { toast: (options: UIToastOptions) => string } | null {
  // TODO: wire useToast from ui-looper once hook can be re-exported through MF
  return null;
}

/** Suspense-контейнер для компонентов ui-looper */
export function UIContainer({ children, fallback }: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? <div className="ui-looper-loading">Loading UI components…</div>}>
      {children}
    </Suspense>
  );
}
