import { useTheme } from './ThemeContext';
import { type ButtonProps } from './types';

const variantStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
} as const;

const sizeStyles = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
} as const;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const { theme } = useTheme();
  const classes = [
    'btn',
    variantStyles[variant],
    sizeStyles[size],
    `btn-${theme}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
