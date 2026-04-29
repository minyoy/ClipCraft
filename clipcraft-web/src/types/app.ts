export type Density = 'compact' | 'comfortable' | 'spacious';

export interface ThemeTweaks {
  accent: string;
  darkSidebar: boolean;
  density: Density;
}

export interface ScenarioItem {
  id: number;
  ko: string;
  en: string;
}

export interface HighlightSegment {
  scenario: string;
  start: number;
  end: number;
}

export interface EditorHighlightSegment extends HighlightSegment {
  id: number;
  sourceId: number;
}

export interface HighlightAnalysisData {
  segments: EditorHighlightSegment[];
  duration: number;
  barCount: number;
  amplitudes: number[];
}

export interface HighlightAnalysisResult extends HighlightAnalysisData {
  projectName?: string;
  videoUrl?: string;
  videoName?: string;
}

export interface PendingHighlightAnalysis {
  file: File;
  projectName: string;
  scenarios: ScenarioItem[];
  videoUrl: string;
  videoName: string;
}

export interface Segment {
  id: number;
  label: string;
  time: string;
}

export interface OverlaySegment {
  left: number;
  width: number;
  label: string;
  sub: string;
  bg: string;
  border: string;
  text: string;
}

export type ExportState = 'idle' | 'loading' | 'done';

export type BadgeStyle = 'outline' | 'solid';

export type ChatMessage =
  | {
      role: 'user';
      text: string;
    }
  | {
      role: 'bot';
      result: {
        title: string;
        bullets: string[];
        note?: string;
        badge: {
          label: string;
          style: BadgeStyle;
        };
      };
    };
