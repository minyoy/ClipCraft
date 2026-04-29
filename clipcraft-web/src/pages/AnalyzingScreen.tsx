import { useEffect, useRef, useState } from 'react';
import { requestAnalyze } from '../api/analyze';
import { useTheme } from '../App';
import Logo from '../components/Logo';
import MonoLabel from '../components/MonoLabel';
import PillButton from '../components/PillButton';
import type { HighlightAnalysisResult, PendingHighlightAnalysis } from '../types/app';

const ANALYSIS_STEPS = [
  { id: 0, label: '영상 파일 수신 중', sub: 'GPU 서버로 전송하는 중...', duration: 1800 },
  { id: 1, label: '프레임 디코딩', sub: 'H.264 디코더 초기화 완료', duration: 2200 },
  { id: 2, label: '씬 경계 감지', sub: 'Shot boundary detection 실행 중...', duration: 2800 },
  { id: 3, label: '오디오 파형 분석', sub: '무음 구간 및 음성 타임라인 추출 중...', duration: 2000 },
  { id: 4, label: '시나리오 매핑', sub: '입력하신 장면 순서와 대조 중...', duration: 2400 },
  { id: 5, label: '하이라이트 구간 확정', sub: '편집 타임라인 생성 완료', duration: 1400 },
];

interface AnalyzingScreenProps {
  request: PendingHighlightAnalysis;
  onDone: (result: HighlightAnalysisResult) => void;
  onBack: () => void;
}

export default function AnalyzingScreen({ request, onDone, onBack }: AnalyzingScreenProps) {
  const { accent } = useTheme();
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const totalDuration = ANALYSIS_STEPS.reduce((s, t) => s + t.duration, 0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const startTimeout = window.setTimeout(() => {
      if (cancelled) return;

      let elapsed = 0;
      let currentStep = 0;
      let stepElapsed = 0;
      const interval = 40;

      timer = window.setInterval(() => {
        elapsed += interval;
        stepElapsed += interval;

        const step = ANALYSIS_STEPS[currentStep];
        const pct = Math.min(1, stepElapsed / step.duration);
        setProgress(Math.min(95, Math.round((elapsed / totalDuration) * 100)));

        if (pct >= 1) {
          setLogLines((prev) => [...prev, `✓  ${step.label}`]);
          if (currentStep < ANALYSIS_STEPS.length - 1) {
            currentStep++;
            stepElapsed = 0;
            setStepIdx(currentStep);
          } else {
            window.clearInterval(timer);
            setProgress(95);
          }
        }
      }, interval);

      const apiStart = performance.now();
      requestAnalyze(request.file, request.scenarios, request.projectName)
        .then((analysis) => {
          if (cancelled) return;
          console.log(`[ClipCraft] API 응답 시간: ${((performance.now() - apiStart) / 1000).toFixed(2)}s`);

          if (timer !== undefined) window.clearInterval(timer);
          setLogLines((prev) => {
            const completed = new Set(prev.map((line) => line.replace(/^✓\s+/, '')));
            const remaining = ANALYSIS_STEPS.filter((step) => !completed.has(step.label)).map((step) => `✓  ${step.label}`);
            return [...prev, ...remaining];
          });
          setProgress(100);
          setDone(true);

          window.setTimeout(() => {
            if (!cancelled) {
              onDoneRef.current({
                ...analysis,
                projectName: analysis.projectName,
                videoUrl: request.videoUrl,
                videoName: request.videoName,
              });
            }
          }, 700);
        })
        .catch(() => {
          if (cancelled) return;
          console.log(`[ClipCraft] API 응답 시간 (실패): ${((performance.now() - apiStart) / 1000).toFixed(2)}s`);

          if (timer !== undefined) window.clearInterval(timer);
          setError('분석 요청에 실패했습니다. API 주소와 서버 상태를 확인해 주세요.');
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimeout);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [request.file, request.projectName, request.scenarios, request.videoName, request.videoUrl, totalDuration]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const currentStep = ANALYSIS_STEPS[stepIdx];
  const overallPct = Math.min(100, progress);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafafa] p-10">
      <div className="absolute top-8 left-10">
        <Logo height={32} />
      </div>

      <div className="flex w-full max-w-[440px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-[72px] w-[72px]">
            <svg
              className="absolute inset-0"
              style={{ animation: done ? 'none' : 'analyzing-spin 1.4s linear infinite' }}
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
            >
              <style>{`@keyframes analyzing-spin { to { transform: rotate(360deg); } }`}</style>
              <circle cx="36" cy="36" r="32" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
              <circle
                cx="36"
                cy="36"
                r="32"
                stroke={accent}
                strokeWidth="4"
                strokeDasharray="50 151"
                strokeLinecap="round"
                style={{ transformOrigin: '36px 36px' }}
              />
            </svg>
            <div
              className="absolute flex items-center justify-center rounded-[14px] transition-all duration-[400ms]"
              style={{
                inset: 12,
                background: done ? accent : '#fff',
                border: `1.5px solid ${done ? accent : 'rgba(0,0,0,0.1)'}`,
                boxShadow: done ? `0 4px 20px ${accent}44` : '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              {done ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                  <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
                  <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
                  <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
                  <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
                </svg>
              )}
            </div>
          </div>

          <div className="text-center">
            <MonoLabel className="mb-2 block">GPU Server · Analyzing</MonoLabel>
            <h2 className="mb-1.5 text-[28px] font-[620] leading-[1.15] tracking-[-0.8px]">
              {done ? '분석 완료!' : '영상을 분석하고 있어요'}
            </h2>
            <p className="whitespace-pre-line text-[14px] leading-[1.55] tracking-[-0.1px] text-[rgba(0,0,0,0.38)]">
              {error
                ? error
                : done
                ? '편집 화면으로 이동합니다...'
                : 'GPU 서버에서 영상과 시나리오를 처리 중입니다.\n잠시만 기다려 주세요.'}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[480] tracking-[-0.1px] text-[rgba(0,0,0,0.45)]">
              {done ? '완료' : currentStep.label}
            </span>
            <span className="font-mono text-[12px] font-[500]" style={{ color: accent }}>
              {overallPct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(0,0,0,0.07)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${overallPct}%`, background: accent, transition: 'width 0.1s linear' }}
            />
          </div>
          {!done && (
            <span className="font-mono text-[11.5px] tracking-[0.1px] text-[rgba(0,0,0,0.3)]">
              {error || currentStep.sub}
            </span>
          )}
        </div>

        {error && (
          <PillButton variant="white" onClick={onBack} className="px-6 py-3 text-sm font-semibold">
            업로드 화면으로 돌아가기
          </PillButton>
        )}
      </div>
    </div>
  );
}
