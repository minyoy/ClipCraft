import { useState } from 'react';
import { useTheme } from '../App';
import { cn } from '../lib/cn';
import Icon from './Icon';
import { icons } from './icons';
import type { PillButtonProps } from '../types/components/PillButton';

export default function PillButton({
  children,
  variant = 'black',
  onClick,
  icon,
  iconRight,
  className,
  style = {},
  small = false,
  accentOverride,
  disabled = false,
  fullWidth = false,
  loading = false,
  type = 'button',
}: PillButtonProps) {
  const { accent } = useTheme();
  const color = accentOverride || accent;
  const [hovered, setHovered] = useState(false);

  const variants = {
    accent: { background: hovered ? `${color}dd` : color, color: '#fff' },
    black: { background: hovered ? '#222' : '#000', color: '#fff' },
    white: {
      background: hovered ? '#f5f5f5' : '#fff',
      color: '#000',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
    },
    glass: {
      background: hovered ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.05)',
      color: '#000',
    },
    danger: { background: hovered ? '#c92a2a' : '#dc2626', color: '#fff' },
  };
  const disabledStyle = {
    background: 'rgba(0,0,0,0.08)',
    color: 'rgba(0,0,0,0.28)',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border-0 font-[480] tracking-[-0.14px] outline-none transition-all duration-[180ms] ease-out',
        disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer',
        fullWidth && 'w-full justify-center',
        small ? 'px-4 py-[7px] text-[13px]' : 'px-[22px] py-2.5 text-[14.5px]',
        className,
      )}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => {
        if (!disabled && !loading) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      style={{ ...(disabled ? disabledStyle : variants[variant]), opacity: loading ? 0.72 : disabled ? 1 : undefined, ...style }}
      type={type}
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
          <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : (
        icon && <Icon d={icons[icon]} size={14} />
      )}
      {children}
      {iconRight && !loading && <Icon d={icons[iconRight]} size={14} />}
    </button>
  );
}
