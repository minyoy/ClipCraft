import { ApiError, getApiUrl, requestJson } from '@/api/client';
import type { HighlightAnalysisData, ScenarioItem } from '@/types/app';

const DEFAULT_ANALYZE_API_URL = '/analyze';

export interface AnalyzeRequestBody {
  project_name: string;
  scenarios: string[];
}

export interface AnalyzeResultItem {
  project_name: string;
  id: number;
  scenario: string;
  score?: number;
  start: number;
  end: number;
  title?: string;
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
  video_path?: string | null;
}

function buildProjectName(file: File, projectName?: string): string {
  return projectName?.trim() || file.name.replace(/\.[^/.]+$/, '') || file.name;
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
    score: item.score,
    start: item.start,
    end: item.end,
    title: item.title,
  }));

  return {
    segments,
    duration: firstItem?.audio.duration ?? 0,
    barCount: firstItem?.audio.barCount ?? 0,
    amplitudes: firstItem?.audio.amplitudes ?? [],
  };
}


export async function startAnalyzeJob(file: File, scenarios: ScenarioItem[], projectName?: string): Promise<AnalyzeJobStartResponse> {
  const endpoint = `${getAnalyzeEndpoint()}/jobs`;

  const formData = new FormData();
  formData.append('video', file, file.name);
  formData.append('project_name', buildProjectName(file, projectName));
  formData.append('scenarios', JSON.stringify(scenarios.map((item) => item.ko)));

  return requestJson<AnalyzeJobStartResponse>(endpoint, {
    method: 'POST',
    body: formData,
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
