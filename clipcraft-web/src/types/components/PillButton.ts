import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import type { IconName } from '../../components/icons';

export type PillVariant = 'accent' | 'black' | 'white' | 'glass' | 'danger';

export interface PillButtonProps {
  children: ReactNode;
  variant?: PillVariant;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  icon?: IconName | null;
  iconRight?: IconName | null;
  className?: string;
  style?: CSSProperties;
  small?: boolean;
  accentOverride?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}
