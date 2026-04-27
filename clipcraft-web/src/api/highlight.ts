import { getApiUrl, requestJson } from './client';
import type { HighlightAnalysisData, HighlightSegment, ScenarioItem } from '../types/app';

const DEFAULT_HIGHLIGHT_API_URL = '/api/highlights';
const USE_MOCK_HIGHLIGHT_RESPONSE = true;

interface HighlightApiItem {
  id: number;
  segment: HighlightSegment | HighlightSegment[];
  duration: number;
  barCount: number;
  amplitudes: number[];
}

type HighlightApiResponse = HighlightApiItem | HighlightApiItem[];

function buildMockHighlightResponse(scenarios: ScenarioItem[]): HighlightApiResponse {
  const scenarioLabels = scenarios.length > 0 ? scenarios.map((item) => item.ko) : ['인트로', '핵심 장면', '마무리'];

  return {
    id: 1,
    segment: scenarioLabels.map((scenario, index) => {
      const start = 12.4 + index * 42.8;

      return {
        scenario,
        start: Math.round(start * 10) / 10,
        end: Math.round((start + 18.6 + index * 2.5) * 10) / 10,
      };
    }),
    duration: 197.3,
    barCount: 88,
    amplitudes: Array.from({ length: 88 }, (_, index) => {
      const wave = Math.abs(Math.sin(index * 0.33) * 0.58) + Math.abs(Math.cos(index * 0.17) * 0.28);
      return Math.round(Math.min(0.95, wave + 0.04) * 1_000_000) / 1_000_000;
    }),
  };
}

export function normalizeHighlightResponse(response: HighlightApiResponse): HighlightAnalysisData {
  const items = Array.isArray(response) ? response : [response];
  let segmentId = 1;
  const firstItem = items[0];
  const segments = items.flatMap((item) => {
    const itemSegments = Array.isArray(item.segment) ? item.segment : [item.segment];

    return itemSegments.map((segment) => ({
      id: segmentId++,
      sourceId: item.id,
      scenario: segment.scenario,
      start: segment.start,
      end: segment.end,
    }));
  });

  return {
    segments,
    duration: firstItem?.duration ?? 0,
    barCount: firstItem?.barCount ?? 0,
    amplitudes: firstItem?.amplitudes ?? [],
  };
}

export async function requestHighlightAnalysis(file: File, scenarios: ScenarioItem[]): Promise<HighlightAnalysisData> {
  if (USE_MOCK_HIGHLIGHT_RESPONSE) {
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    return normalizeHighlightResponse(buildMockHighlightResponse(scenarios));
  }

  const endpoint = getApiUrl(import.meta.env.VITE_HIGHLIGHT_API_URL, DEFAULT_HIGHLIGHT_API_URL);
  const formData = new FormData();

  formData.append('video', file);
  formData.append('scenarios', JSON.stringify(scenarios.map((item) => item.ko)));

  const data = await requestJson<HighlightApiResponse>(endpoint, {
    method: 'POST',
    body: formData,
  });

  return normalizeHighlightResponse(data);
}
