import type { HighlightAnalysisResult } from '@/types/app';

const exampleVideoUrl = '';

const mockAmplitudes = Array.from({ length: 88 }, (_, index) => {
  const base = Math.abs(Math.sin(index * 0.42)) * 0.72;
  const accent = index % 11 === 0 ? 0.38 : 0;
  const variation = Math.abs(Math.cos(index * 0.17 + 0.6)) * 0.28;

  return Number(Math.min(1, base + accent + variation).toFixed(3));
});

export const mockEditorAnalysis: HighlightAnalysisResult = {
  projectName: '샤브샤브 만들기 영상',
  videoName: 'example.mp4',
  videoUrl: exampleVideoUrl,
  duration: 197.4,
  barCount: 88,
  amplitudes: mockAmplitudes,
  segments: [
    {
      id: 1,
      sourceId: 1,
      scenario: '숙주 넣는 장면',
      score: 0.94,
      start: 18.5,
      end: 35.2,
      title: '숙주 넣는 장면',
    },
    {
      id: 2,
      sourceId: 2,
      scenario: '청경채 넣는 장면',
      score: 0.91,
      start: 56.8,
      end: 78.4,
      title: '청경채 넣는 장면',
    },
    {
      id: 3,
      sourceId: 3,
      scenario: '우삼겹 넣는 장면',
      score: 0.89,
      start: 104.1,
      end: 132.6,
      title: '우삼겹 넣는 장면',
    },
    {
      id: 4,
      sourceId: 4,
      scenario: '굴소스 넣는 장면',
      score: 0.86,
      start: 165.3,
      end: 188.7,
      title: '굴소스 넣는 장면',
    },
  ],
};
