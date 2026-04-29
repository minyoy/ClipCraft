import { getApiUrl, requestStatusJson } from './client';
import type { HighlightAnalysisData, ScenarioItem } from '../types/app';

const DEFAULT_ANALYZE_API_URL = '/analyze';
const LOCAL_VIDEO_BASE_PATH = '/Users/jumin-yeong/Documents/GitHub/ClipCraft/clip_search/';

interface AnalyzeRequestBody {
  project_name: string;
  video_path: string;
  scenarios: string[];
}

interface AnalyzeResultItem {
  project_name: string;
  id: number;
  scenario: string;
  start: number;
  end: number;
  audio: {
    duration: number;
    barCount: number;
    amplitudes: number[];
  };
}

type FileWithPath = File & {
  path?: string;
  webkitRelativePath?: string;
};

function buildVideoPath(file: File): string {
  const fileWithPath = file as FileWithPath;
  return fileWithPath.path || fileWithPath.webkitRelativePath || `${LOCAL_VIDEO_BASE_PATH}${file.name}`;
}

export function normalizeAnalyzeResponse(items: AnalyzeResultItem[]): HighlightAnalysisData {
  let segmentId = 1;
  const firstItem = items[0];
  const segments = items.map((item) => ({
    id: segmentId++,
    sourceId: item.id,
    scenario: item.scenario,
    start: item.start,
    end: item.end,
  }));

  return {
    segments,
    duration: firstItem?.audio.duration ?? 0,
    barCount: firstItem?.audio.barCount ?? 0,
    amplitudes: firstItem?.audio.amplitudes ?? [],
  };
}

export async function requestAnalyze(file: File, scenarios: ScenarioItem[], projectName?: string): Promise<HighlightAnalysisData & { projectName?: string }> {
  const endpoint = getApiUrl(import.meta.env.VITE_ANALYZE_API_URL, DEFAULT_ANALYZE_API_URL);
  const body: AnalyzeRequestBody = {
    project_name: projectName?.trim() || file.name.replace(/\.[^/.]+$/, '') || file.name,
    video_path: buildVideoPath(file),
    scenarios: scenarios.map((item) => item.ko),
  };

  const response = await requestStatusJson<AnalyzeResultItem[]>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return {
    ...normalizeAnalyzeResponse(response.results),
    projectName: response.project,
  };
}
