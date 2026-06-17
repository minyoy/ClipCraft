import type { MouseEvent } from 'react';
import Icon from '@/components/Icon';
import { icons } from '@/components/icons';
import MonoLabel from '@/components/MonoLabel';
import type { WaveformTimelineProps } from '@/types/pages/EditorScreen';
import type { OverlaySegment } from '@/types/app';

const overlayColors = [
  { bg: 'rgba(254,243,199,0.82)', border: '#F59E0B', text: '#92400E' },
  { bg: 'rgba(209,250,229,0.82)', border: '#10B981', text: '#065F46' },
  { bg: 'rgba(254,226,226,0.82)', border: '#EF4444', text: '#991B1B' },
];

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function buildTimeMarks(duration: number): string[] {
  const marks = 8;
  return Array.from({ length: marks + 1 }, (_, index) => formatTime((duration / marks) * index));
}

export default function WaveformTimeline({ accent, duration, onSegmentChange, progress, segments, setPlaying, setProgress, waveHeights: heights }: WaveformTimelineProps) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 1;
  const timeMarks = buildTimeMarks(safeDuration);
  const markers = segments.flatMap((segment) => [
    {
      id: `${segment.id}-start`,
      edge: 'start' as const,
      segmentId: segment.id,
      position: Math.min(100, Math.max(0, (segment.start / safeDuration) * 100)),
    },
    {
      id: `${segment.id}-end`,
      edge: 'end' as const,
      segmentId: segment.id,
      position: Math.min(100, Math.max(0, (segment.end / safeDuration) * 100)),
    },
  ]).sort((a, b) => a.position - b.position);
  const overlaySegments: OverlaySegment[] = segments.map((segment, index) => {
    const colors = overlayColors[index % overlayColors.length];
    const start = Math.min(100, Math.max(0, (segment.start / safeDuration) * 100));
    const end = Math.min(100, Math.max(start + 1, (segment.end / safeDuration) * 100));

    return {
      left: start,
      width: Math.max(1, end - start),
      label: segment.scenario,
      sub: `${formatTime(segment.start)}-${formatTime(segment.end)}`,
      ...colors,
    };
  });

  const startMarkerDrag = (event: MouseEvent<HTMLButtonElement>, segmentId: number, edge: 'start' | 'end') => {
    event.preventDefault();
    event.stopPropagation();
    setPlaying(false);

    const track = event.currentTarget.parentElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const updateTime = (clientX: number) => {
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSegmentChange(segmentId, edge, ratio * safeDuration);
      setProgress(ratio);
    };
    const onMove = (moveEvent: globalThis.MouseEvent) => updateTime(moveEvent.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    updateTime(event.clientX);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="flex flex-col gap-2.5 border-b border-[rgba(0,0,0,0.08)] px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon d={icons.sparkles} size={11} stroke="rgba(0,0,0,0.38)" strokeWidth={2} />
          <MonoLabel className="text-[8.5px] tracking-[0.08em]">시나리오 하이라이트</MonoLabel>
        </div>
        <MonoLabel className="text-[8.5px] tracking-[0.08em]">{formatTime(safeDuration)}</MonoLabel>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#f6f6f5]">
        <div className="relative h-5 border-b border-[rgba(0,0,0,0.08)] bg-[#efeeed]">
          {markers.map((marker, index) => (
            <button
              key={marker.id}
              aria-label={`${index + 1}번 ${marker.edge === 'start' ? '시작' : '끝'} 지점 조절`}
              className="absolute top-1/2 z-[4] flex h-[13px] w-[13px] cursor-ew-resize items-center justify-center rounded-full border-0 p-0 font-mono text-[6.5px] font-bold text-white transition-transform hover:scale-125"
              onMouseDown={(event) => startMarkerDrag(event, marker.segmentId, marker.edge)}
              style={{
                background: accent,
                left: `${marker.position}%`,
                transform: 'translate(-50%,-50%)',
              }}
              title="좌우로 드래그해서 구간을 조절"
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setProgress(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
            setPlaying(false);
          }}
          className="relative flex h-[50px] cursor-crosshair items-center gap-px px-0.5 py-[3px]"
        >
          {heights.map((height, index) => (
            <div
              key={index}
              className="relative z-[1] flex-1 rounded-px"
              style={{
                background: index / heights.length < progress ? `${accent}8c` : 'rgba(0,0,0,0.10)',
                height: Math.min(42, Math.max(4, height)),
              }}
            />
          ))}

          {overlaySegments.map((segment) => (
            <div
              key={segment.label}
              className="absolute top-0 bottom-0 z-[2] flex flex-col items-start justify-center overflow-hidden border-l-2 border-r-2 px-1"
              style={{
                background: segment.bg,
                borderLeftColor: segment.border,
                borderRightColor: segment.border,
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
            >
              <span className="font-mono text-[6.5px] leading-[1.4] font-semibold whitespace-nowrap" style={{ color: segment.text }}>
                {segment.label}
              </span>
              <span className="font-mono text-[6px] leading-[1.4] whitespace-nowrap" style={{ color: `${segment.text}aa` }}>
                {segment.sub}
              </span>
            </div>
          ))}

          <div className="pointer-events-none absolute top-0 bottom-0 z-[4] w-[1.5px]" style={{ background: accent, left: `${progress * 100}%` }} />
        </div>

        <div className="flex justify-between border-t border-[rgba(0,0,0,0.08)] bg-[#efeeed] px-1.5 py-[3px]">
          {timeMarks.map((time, index) => (
            <span key={time} className="font-mono text-[6.5px]" style={{ color: index % 3 === 0 ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.13)' }}>
              {index % 2 === 0 ? time : '·'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
