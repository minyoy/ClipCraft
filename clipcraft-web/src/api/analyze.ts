import { ApiError, getApiUrl, requestJson, requestStatusJson } from '@/api/client';
import type { HighlightAnalysisData, ScenarioItem } from '@/types/app';

const DEFAULT_ANALYZE_API_URL = '/analyze';
const DEFAULT_LOCAL_VIDEO_BASE_PATH = '/app/clip_search/';

export interface AnalyzeRequestBody {
  project_name: string;
  video_path: string;
  scenarios: string[];
}

export interface AnalyzeResultItem {
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

export interface AnalyzeJobStartResponse {
  status: string;
  job_id: string;
}

export interface AnalyzeJobStatus {
  status: 'queued' | 'running' | 'success' | 'error' | string;
  progress: number;
  step_id: number;
  step_label: string;
  message: string;
  logs: string[];
  project: string;
  results: AnalyzeResultItem[];
  error?: string | null;
}

type FileWithPath = File & {
  path?: string;
  webkitRelativePath?: string;
};

function buildVideoPath(file: File): string {
  const fileWithPath = file as FileWithPath;
  const basePath = import.meta.env.VITE_LOCAL_VIDEO_BASE_PATH || DEFAULT_LOCAL_VIDEO_BASE_PATH;
  return fileWithPath.path || fileWithPath.webkitRelativePath || `${basePath}${file.name}`;
}

function buildAnalyzeRequestBody(file: File, scenarios: ScenarioItem[], projectName?: string): AnalyzeRequestBody {
  return {
    project_name: projectName?.trim() || file.name.replace(/\.[^/.]+$/, '') || file.name,
    video_path: buildVideoPath(file),
    scenarios: scenarios.map((item) => item.ko),
  };
}

function getAnalyzeEndpoint(): string {
  return getApiUrl(import.meta.env.VITE_ANALYZE_API_URL, DEFAULT_ANALYZE_API_URL);
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
  const endpoint = getAnalyzeEndpoint();
  const body = buildAnalyzeRequestBody(file, scenarios, projectName);

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

export async function startAnalyzeJob(file: File, scenarios: ScenarioItem[], projectName?: string): Promise<AnalyzeJobStartResponse> {
  const endpoint = `${getAnalyzeEndpoint()}/jobs`;

  return requestJson<AnalyzeJobStartResponse>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildAnalyzeRequestBody(file, scenarios, projectName)),
  });
}

export async function getAnalyzeJob(jobId: string): Promise<AnalyzeJobStatus> {
  const response = await fetch(`${getAnalyzeEndpoint()}/jobs/${jobId}`);
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(body?.message || body?.detail || body?.error || `API request failed: ${response.status}`, response.status);
  }

  return body as AnalyzeJobStatus;
}
