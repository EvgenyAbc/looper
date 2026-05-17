import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/** Props for federated `ui_looper/Button` */
export interface UIButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Props for federated `ui_looper/Badge` */
export interface UIBadgeProps {
  children?: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  mode?: 'dot' | 'count' | 'text';
  count?: number;
  maxCount?: number;
  text?: ReactNode;
  standalone?: boolean;
  className?: string;
}

/** Props for federated `ui_looper/Card` */
export interface UICardProps {
  children?: ReactNode;
  variant?: 'default' | 'outlined' | 'ghost';
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface UICardHeaderProps {
  children?: ReactNode;
  className?: string;
}

export interface UICardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  noPadding?: boolean;
}

export interface UICardFooterProps {
  children?: ReactNode;
  className?: string;
}

/** Props for federated `ui_looper/Input` */
export interface UIInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'warning' | 'success';
  label?: ReactNode;
  helper?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

export interface UISelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface UISelectGroup {
  label: ReactNode;
  options: UISelectOption[];
}

/** Props for federated `ui_looper/Select` */
export interface UISelectProps {
  mode?: 'single' | 'multiple' | 'tags';
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  options?: (UISelectOption | UISelectGroup)[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  status?: 'default' | 'error' | 'warning' | 'success';
  label?: ReactNode;
  helper?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

/** Props for federated `ui_looper/Tag` */
export interface UITagProps {
  children?: ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  onClose?: () => void;
  closeIcon?: ReactNode;
  className?: string;
}

/** Props for federated `ui_looper/Spinner` */
export interface UISpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'accent' | 'current';
  label?: string;
  className?: string;
}

/** Props for federated `ui_looper/Tooltip` */
export interface UITooltipProps {
  title: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  trigger?: 'hover' | 'click' | 'focus';
  arrow?: boolean;
  maxWidth?: number | string;
}

/** Props for federated `ui_looper/Text` */
export interface UITextProps {
  children?: ReactNode;
  variant?: 'body' | 'caption' | 'label' | 'help' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success' | 'warning' | 'inverse';
  truncate?: boolean;
  className?: string;
  as?: string;
}

/** Props for federated `ui_looper/Heading` */
export interface UIHeadingProps {
  children?: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  truncate?: boolean;
  className?: string;
}

/** Props for federated `ui_looper/Modal` */
export interface UIModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  footer?: ReactNode;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  width?: number | string;
}

/** Options passed to `useToast` from federated `ui_looper/Toast` */
export interface UIToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: ReactNode;
  description?: ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

/** Props for federated `ui_looper/Toast` provider */
export interface UIToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}
