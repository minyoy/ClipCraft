export const MAX_VIDEO_DURATION_SECONDS = 15 * 60;

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(2)} MB`;
}

export function loadVideoDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      const { duration } = video;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('VIDEO_METADATA_LOAD_FAILED'));
    };
    video.src = objectUrl;
  });
}

export function captureVideoThumbnail(objectUrl: string, duration: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    let timeoutId: number | undefined;
    let fallbackFrameId: number | undefined;
    let settled = false;

    const cleanup = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (fallbackFrameId !== undefined) window.clearTimeout(fallbackFrameId);
      video.removeAttribute('src');
      video.load();
    };

    const seekTime = getThumbnailSeekTime(duration);
    const captureFrame = () => {
      if (settled) return;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const context = canvas.getContext('2d');

      if (!context) {
        settled = true;
        cleanup();
        reject(new Error('CANVAS_CONTEXT_UNAVAILABLE'));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.82);
      settled = true;
      cleanup();
      resolve(thumbnail);
    };

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => {
      video.currentTime = seekTime;
    };
    video.onseeked = () => {
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(() => captureFrame());
      }
      fallbackFrameId = window.setTimeout(captureFrame, 120);
    };
    video.onerror = () => {
      settled = true;
      cleanup();
      reject(new Error('VIDEO_THUMBNAIL_CAPTURE_FAILED'));
    };
    timeoutId = window.setTimeout(() => {
      settled = true;
      cleanup();
      reject(new Error('VIDEO_THUMBNAIL_CAPTURE_TIMEOUT'));
    }, 8000);
    video.src = objectUrl;
    video.load();
  });
}

function getThumbnailSeekTime(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const target = Math.max(1, duration * 0.1);
  return Math.min(target, Math.max(0, duration - 0.1));
}
