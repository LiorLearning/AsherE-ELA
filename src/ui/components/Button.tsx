import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 12,
  fontWeight: 800,
  transition: 'all 160ms ease',
  cursor: 'pointer',
  userSelect: 'none',
  border: 'none',
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 10px 24px rgba(79,70,229,0.35)' },
  secondary: { background: 'var(--color-secondary)', color: '#0f172a' },
  outline: { background: '#fff', color: 'var(--color-primary)', border: '2px solid var(--color-border)' },
  ghost: { background: 'transparent', color: 'var(--color-primary)' },
  danger: { background: 'var(--color-danger)', color: '#fff' },
  link: { background: 'transparent', color: 'var(--color-primary)', textDecoration: 'underline' },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '8px 10px', borderRadius: 10, fontSize: 12 },
  md: { padding: '12px 14px', borderRadius: 12, fontSize: 14 },
  lg: { padding: '16px 20px', borderRadius: 16, fontSize: 18 },
  icon: { padding: 10, width: 44, height: 44, borderRadius: 12 },
};

export function Button({ variant = 'primary', size = 'md', style, children, ...rest }: Props): JSX.Element {
  return (
    <button
      {...rest}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}


