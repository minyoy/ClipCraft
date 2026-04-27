import type { Dispatch, SetStateAction } from 'react';
import type { ThemeTweaks } from '../../types/app';

export interface TweaksPanelProps {
  tweaks: ThemeTweaks;
  setTweaks: Dispatch<SetStateAction<ThemeTweaks>>;
  onClose: () => void;
}
