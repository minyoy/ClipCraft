import type { CSSProperties, ReactNode } from 'react';
import type { IconName } from '../../components/icons';

export type PillVariant = 'accent' | 'black' | 'white' | 'glass';

export interface PillButtonProps {
  children: ReactNode;
  variant?: PillVariant;
  onClick?: () => void;
  icon?: IconName | null;
  className?: string;
  style?: CSSProperties;
  small?: boolean;
  accentOverride?: string;
  disabled?: boolean;
}
