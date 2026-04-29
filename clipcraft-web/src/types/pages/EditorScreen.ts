import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { IconName } from '../../components/icons';
import type { ChatMessage as AppChatMessage, EditorHighlightSegment, HighlightAnalysisData } from '../app';

export interface EditorScreenProps {
  onBack: () => void;
  analysis?: HighlightAnalysisData;
  projectName?: string;
  videoUrl?: string;
  videoName?: string;
}

export interface PlayerControlsProps {
  accent: string;
  dragging: boolean;
  duration: number;
  muted: boolean;
  onSeekForward: () => void;
  onToggleMute: () => void;
  playing: boolean;
  progress: number;
  scrubberRef: RefObject<HTMLDivElement | null>;
  setDragging: Dispatch<SetStateAction<boolean>>;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
}

export interface WaveformTimelineProps {
  accent: string;
  duration: number;
  onSegmentChange: (segmentId: number, edge: 'start' | 'end', time: number) => void;
  progress: number;
  segments: EditorHighlightSegment[];
  setPlaying: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  waveHeights: number[];
}

export interface HighlightListProps {
  activeSegment: number | null;
  onSegmentClick: (index: number) => void;
  segments: EditorHighlightSegment[];
  thumbnails: Record<number, string>;
}

export interface AccentProps {
  accent: string;
}

export interface ChatMessageProps extends AccentProps {
  message: AppChatMessage;
}

export interface RoundIconButtonProps {
  active?: boolean;
  ariaLabel?: string;
  icon: IconName;
  onClick?: () => void;
  size?: number;
}

export type EditorChatMessage = AppChatMessage;
