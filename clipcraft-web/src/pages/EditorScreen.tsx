import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../App';
import Logo from '../components/Logo';
import PillButton from '../components/PillButton';
import AiAssistant from '../components/EditorScreen/AiAssistant';
import HighlightList from '../components/EditorScreen/HighlightList';
import PlayerControls, { getScrubPosition } from '../components/EditorScreen/PlayerControls';
import VideoPreview from '../components/EditorScreen/VideoPreview';
import WaveformTimeline from '../components/EditorScreen/WaveformTimeline';
import { applyEditorNaturalLanguageCommand } from '../lib/editorNaturalLanguageCommands';
import { loadDeletedSegmentIds, loadSegmentEditSettings, saveDeletedSegmentIds, saveSegmentEditSettings } from '../lib/editorStorage';
import type { EditorHighlightSegment, ExportState, SegmentEditSetting } from '../types/app';
import type { EditorScreenProps, NaturalLanguageCommandResult } from '../types/pages/EditorScreen';

const fallbackWaveHeights = Array.from(
  { length: 88 },
  (_, index) => 4 + Math.abs(Math.sin(index * 0.38 + 0.9) * 18) + Math.abs(Math.cos(index * 0.7) * 8),
);

function amplitudesToWaveHeights(amplitudes: number[]): number[] {
  if (amplitudes.length === 0) return fallbackWaveHeights;

  const maxAmplitude = Math.max(...amplitudes, 1);
  return amplitudes.map((amplitude) => 4 + (Math.max(0, amplitude) / maxAmplitude) * 28);
}

function filterDeletedSegments(segments: EditorHighlightSegment[], deletedSegmentIds: number[]): EditorHighlightSegment[] {
  const deletedIds = new Set(deletedSegmentIds);
  return segments.filter((segment) => !deletedIds.has(segment.id));
}

function filterStoredEditSettings(settings: SegmentEditSetting[], segments: EditorHighlightSegment[], deletedSegmentIds: number[]): SegmentEditSetting[] {
  const segmentIds = new Set(segments.map((segment) => segment.id));
  const deletedIds = new Set(deletedSegmentIds);
  return settings.filter((setting) => segmentIds.has(setting.segmentId) && !deletedIds.has(setting.segmentId));
}

interface CapturedFrame {
  brightness: number;
  url: string;
}

function getFrameBrightness(context: CanvasRenderingContext2D, width: number, height: number): number {
  const sampleWidth = Math.min(64, width);
  const sampleHeight = Math.min(36, height);
  const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  let total = 0;

  for (let index = 0; index < imageData.length; index += 4) {
    total += (imageData[index] + imageData[index + 1] + imageData[index + 2]) / 3;
  }

  return total / (imageData.length / 4);
}

function captureVideoFrame(videoUrl: string, time: number): Promise<CapturedFrame> {
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
    const capture = () => {
      if (settled) return;

      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 180;
      const context = canvas.getContext('2d');

      if (!context) {
        settled = true;
        cleanup();
        reject(new Error('CANVAS_CONTEXT_UNAVAILABLE'));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const brightness = getFrameBrightness(context, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', 0.78);
      settled = true;
      cleanup();
      resolve({
        brightness,
        url,
      });
    };

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : time;
      video.currentTime = Math.min(Math.max(0, time), Math.max(0, duration - 0.05));
    };
    video.onseeked = () => {
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(() => capture());
      }

      fallbackFrameId = window.setTimeout(capture, 160);
    };
    video.onerror = () => {
      settled = true;
      cleanup();
      reject(new Error('VIDEO_FRAME_CAPTURE_FAILED'));
    };
    timeoutId = window.setTimeout(() => {
      settled = true;
      cleanup();
      reject(new Error('VIDEO_FRAME_CAPTURE_TIMEOUT'));
    }, 8000);
    video.src = videoUrl;
    video.load();
  });
}

async function captureSegmentThumbnail(videoUrl: string, start: number, end: number): Promise<string> {
  const safeStart = Math.max(0, start);
  const safeEnd = Math.max(safeStart + 0.1, end);
  const segmentDuration = safeEnd - safeStart;
  const candidates = [
    safeStart + segmentDuration * 0.15,
    safeStart + segmentDuration * 0.5,
    safeStart + segmentDuration * 0.25,
    safeStart + segmentDuration * 0.75,
    safeStart + Math.min(1, segmentDuration * 0.1),
    safeEnd - Math.min(0.1, segmentDuration * 0.1),
  ];
  let bestFrame: CapturedFrame | null = null;

  for (const time of candidates) {
    const frame = await captureVideoFrame(videoUrl, time);

    if (!bestFrame || frame.brightness > bestFrame.brightness) {
      bestFrame = frame;
    }

    if (frame.brightness > 14) {
      return frame.url;
    }
  }

  return bestFrame?.url ?? '';
}

export default function EditorWorkspace({ analysis, onBack, projectName, videoName, videoUrl }: EditorScreenProps) {
  const { accent } = useTheme();
  const [deletedSegmentIds, setDeletedSegmentIds] = useState<number[]>(loadDeletedSegmentIds);
  const [segments, setSegments] = useState<EditorHighlightSegment[]>(() => filterDeletedSegments(analysis?.segments ?? [], loadDeletedSegmentIds()));
  const duration = analysis?.duration && analysis.duration > 0 ? analysis.duration : 15 * 60;
  const waveHeights = amplitudesToWaveHeights(analysis?.amplitudes ?? []);
  const [playing, setPlaying] = useState(false);
  const [playbackDuration, setPlaybackDuration] = useState(duration);
  const [progress, setProgress] = useState(0.52);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [dragging, setDragging] = useState(false);
  const [muted, setMuted] = useState(false);
  const [segmentEditSettings, setSegmentEditSettings] = useState<SegmentEditSetting[]>(() =>
    filterStoredEditSettings(loadSegmentEditSettings(), analysis?.segments ?? [], loadDeletedSegmentIds()),
  );
  const [segmentThumbnails, setSegmentThumbnails] = useState<Record<number, string>>({});
  const scrubberRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const sourceSegments = analysis?.segments ?? [];

    setSegments(filterDeletedSegments(sourceSegments, deletedSegmentIds));
    setSegmentEditSettings((current) => filterStoredEditSettings(current, sourceSegments, deletedSegmentIds));
  }, [analysis?.segments, deletedSegmentIds]);

  useEffect(() => {
    saveSegmentEditSettings(segmentEditSettings);
  }, [segmentEditSettings]);

  useEffect(() => {
    saveDeletedSegmentIds(deletedSegmentIds);
  }, [deletedSegmentIds]);

  useEffect(() => {
    if (!videoUrl || segments.length === 0) {
      setSegmentThumbnails({});
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void Promise.all(
        segments.map(async (segment) => {
          try {
            return [segment.id, await captureSegmentThumbnail(videoUrl, segment.start, segment.end)] as const;
          } catch {
            return [segment.id, ''] as const;
          }
        }),
      ).then((entries) => {
        if (cancelled) return;

        setSegmentThumbnails(
          Object.fromEntries(entries.filter(([, thumbnail]) => thumbnail)),
        );
      });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [segments, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      void video.play().catch(() => setPlaying(false));
      return;
    }

    video.pause();
  }, [playing, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const targetTime = progress * video.duration;
    if (Math.abs(video.currentTime - targetTime) > 0.35 || dragging) {
      video.currentTime = targetTime;
    }
  }, [dragging, progress]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);

      if (event.code !== 'Space' || isEditableTarget) return;

      event.preventDefault();
      setPlaying((current) => !current);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onMove = (event: globalThis.MouseEvent) => {
      if (dragging && scrubberRef.current) {
        setProgress(getScrubPosition(event, scrubberRef.current));
      }
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const seekToSegment = (segment: EditorHighlightSegment, index: number) => {
    const target = segment.start;
    setActiveSegment(index);
    setProgress(Math.min(1, Math.max(0, target / playbackDuration)));
    setPlaying(false);
  };

  const onSegmentClick = (index: number) => {
    const segment = segments[index];
    if (!segment) return;

    seekToSegment(segment, index);
  };

  const onSegmentChange = (segmentId: number, edge: 'start' | 'end', time: number) => {
    setSegments((current) =>
      current.map((segment) => {
        if (segment.id !== segmentId) return segment;

        const minDuration = 0.2;
        const nextTime = Math.min(playbackDuration, Math.max(0, time));

        if (edge === 'start') {
          return {
            ...segment,
            start: Math.min(nextTime, Math.max(0, segment.end - minDuration)),
          };
        }

        return {
          ...segment,
          end: Math.max(nextTime, Math.min(playbackDuration, segment.start + minDuration)),
        };
      }),
    );
  };

  const syncVideoProgress = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    setProgress(Math.min(1, Math.max(0, video.currentTime / video.duration)));
  };

  const syncVideoMetadata = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    video.muted = muted;
    setPlaybackDuration(video.duration);
    setProgress(Math.min(1, Math.max(0, video.currentTime / video.duration)));
  };

  const seekForwardTenSeconds = () => {
    const video = videoRef.current;

    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      setProgress(Math.min(1, Math.max(0, video.currentTime / video.duration)));
      return;
    }

    setProgress((current) => Math.min(1, current + 10 / playbackDuration));
  };

  const onExport = () => {
    if (exportState !== 'idle') return;

    setExportState('loading');
    window.setTimeout(() => setExportState('done'), 2200);
    window.setTimeout(() => setExportState('idle'), 4000);
  };

  const applyNaturalLanguageCommand = (command: string): NaturalLanguageCommandResult => {
    return applyEditorNaturalLanguageCommand({
      activeSegment,
      command,
      playbackDuration,
      progress,
      seekToSegment,
      segments,
      setActiveSegment,
      setDeletedSegmentIds,
      setPlaying,
      setProgress,
      setSegmentEditSettings,
      setSegments,
    });
  };

  return (
    <div className="editor-shell grid h-screen w-full grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)_320px] grid-rows-[52px_minmax(0,1fr)] overflow-hidden bg-white max-[1180px]:h-auto max-[1180px]:min-h-screen max-[1180px]:grid-cols-1 max-[1180px]:grid-rows-[52px_minmax(520px,70vh)_auto_minmax(360px,auto)] max-[1180px]:overflow-visible">
      <header className="col-[1/-1] flex items-center gap-3.5 border-b border-[rgba(0,0,0,0.08)] px-5">
        <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onBack} type="button" aria-label="업로드 화면으로 돌아가기">
          <Logo height={26} />
        </button>
        <div className="h-4 w-px bg-[rgba(0,0,0,0.1)]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[rgba(0,0,0,0.4)]">프로젝트:</span>
          <span className="text-[13px] font-[480] tracking-[-0.1px]">{projectName ?? videoName ?? '하이라이트 편집'}</span>
        </div>
        <div className="flex-1" />
        <PillButton variant="white" icon="history" small>
          작업 기록
        </PillButton>
        <PillButton
          variant="accent"
          icon={exportState === 'loading' ? null : exportState === 'done' ? 'check' : 'download'}
          small
          onClick={onExport}
          style={{ opacity: exportState === 'loading' ? 0.7 : 1, transition: 'all 0.3s' }}
        >
          {exportState === 'loading' ? '내보내는 중...' : exportState === 'done' ? '완료!' : 'MP4로 내보내기'}
        </PillButton>
      </header>

      <main className="flex min-h-0 flex-col overflow-hidden px-5 py-4">
        <VideoPreview
          videoRef={videoRef}
          videoUrl={videoUrl}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={syncVideoMetadata}
          onTimeUpdate={syncVideoProgress}
        />
        <PlayerControls
          accent={accent}
          dragging={dragging}
          duration={playbackDuration}
          muted={muted}
          onSeekForward={seekForwardTenSeconds}
          onToggleMute={() => setMuted((current) => !current)}
          playing={playing}
          progress={progress}
          scrubberRef={scrubberRef}
          setDragging={setDragging}
          setPlaying={setPlaying}
          setProgress={setProgress}
        />
      </main>

      <section className="flex min-h-0 flex-col overflow-hidden">
        <WaveformTimeline
          accent={accent}
          duration={duration}
          onSegmentChange={onSegmentChange}
          progress={progress}
          segments={segments}
          setPlaying={setPlaying}
          setProgress={setProgress}
          waveHeights={waveHeights}
        />
        <HighlightList
          activeSegment={activeSegment}
          onSegmentClick={onSegmentClick}
          segmentEditSettings={segmentEditSettings}
          segments={segments}
          thumbnails={segmentThumbnails}
        />
      </section>

      <AiAssistant accent={accent} onApplyCommand={applyNaturalLanguageCommand} />
    </div>
  );
}
