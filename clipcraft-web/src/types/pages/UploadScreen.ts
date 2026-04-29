import type { PendingHighlightAnalysis } from '../app';

export interface UploadScreenProps {
  onNext: (request: PendingHighlightAnalysis) => void;
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
