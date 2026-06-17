import type { PendingHighlightAnalysis } from '@/types/app';

export interface UploadScreenProps {
  initialProjectFormat?: string;
  initialProjectName?: string;
  onNext: (request: PendingHighlightAnalysis) => void;
  onLogoClick: () => void;
}

export type UploadStatus = 'idle' | 'loading' | 'success';

export interface UploadedVideo {
  file: File;
  fileName: string;
  duration: number;
  durationLabel: string;
  sizeLabel: string;
  thumbnailUrl: string;
  objectUrl: string;
}
