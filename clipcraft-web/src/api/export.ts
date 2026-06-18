import { ApiError, getApiUrl } from '@/api/client';
import type { EditorHighlightSegment, SegmentEditSetting } from '@/types/app';

const DEFAULT_EXPORT_API_URL = '/export';

export interface ExportVideoRequest {
  video_path: string;
  segments: Array<{
    start: number;
    end: number;
    speed: number;
    muted: boolean;
  }>;
}

export async function requestExportVideo(videoPath: string, segments: EditorHighlightSegment[], segmentEditSettings: SegmentEditSetting[]): Promise<Blob> {
  const endpoint = getApiUrl(import.meta.env.VITE_EXPORT_API_URL, DEFAULT_EXPORT_API_URL);
  const settingsBySegmentId = new Map(segmentEditSettings.map((setting) => [setting.segmentId, setting]));
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_path: videoPath,
      segments: segments.map((segment) => {
        const editSetting = settingsBySegmentId.get(segment.id);

        return {
          start: segment.start,
          end: segment.end,
          speed: editSetting?.speed ?? 1,
          muted: editSetting?.muted ?? false,
        };
      }),
    } satisfies ExportVideoRequest),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json') ? await response.json() : null;
    throw new ApiError(body?.message || body?.detail || body?.error || `Export failed: ${response.status}`, response.status);
  }

  return response.blob();
}

export function downloadExportedVideo(blob: Blob, fileName = 'clipcraft_export.mp4'): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
