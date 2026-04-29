import MonoLabel from '../MonoLabel';
import type { WaveformTimelineProps } from '../../types/pages/EditorScreen';
import type { OverlaySegment } from '../../types/app';

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

export default function WaveformTimeline({ accent, duration, progress, segments, setPlaying, setProgress, waveHeights: heights }: WaveformTimelineProps) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 1;
  const timeMarks = buildTimeMarks(safeDuration);
  const markers = segments.flatMap((segment) => [
    {
      id: `${segment.id}-start`,
      position: Math.min(100, Math.max(0, (segment.start / safeDuration) * 100)),
    },
    {
      id: `${segment.id}-end`,
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

  return (
    <div className="flex flex-col gap-2.5 border-b border-[rgba(0,0,0,0.08)] px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="7" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          <MonoLabel>Scenario Highlights</MonoLabel>
        </div>
        <MonoLabel>Total Duration: {formatTime(safeDuration)}</MonoLabel>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-[#fafafa]">
        <div className="relative h-[26px] border-b border-[rgba(0,0,0,0.05)] bg-[#f4f4f4]">
          {markers.map((marker, index) => (
            <div key={marker.id} className="absolute top-1/2 flex items-center justify-center" style={{ left: `${marker.position}%`, transform: 'translate(-50%,-50%)' }}>
              <div
                className="flex h-4 w-4 items-center justify-center rounded-full font-mono text-[7.5px] font-bold text-white"
                style={{ background: accent, boxShadow: `0 1px 4px ${accent}44` }}
              >
                {index + 1}
              </div>
            </div>
          ))}
          <div className="pointer-events-none absolute top-0 bottom-0 z-[3] w-[1.5px]" style={{ background: accent, left: `${progress * 100}%` }} />
        </div>

        <div
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setProgress(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
            setPlaying(false);
          }}
          className="relative flex h-[60px] cursor-crosshair items-center px-0.5 py-1"
        >
          {heights.map((height, index) => (
            <div
              key={index}
              className="relative z-[1] flex-1 rounded-[1px]"
              style={{
                background: index / heights.length < progress ? `${accent}bb` : 'rgba(0,0,0,0.10)',
                height: Math.max(3, height * 0.9),
              }}
            />
          ))}

          {overlaySegments.map((segment) => (
            <div
              key={segment.label}
              className="absolute top-0 bottom-0 z-[2] flex flex-col items-start justify-center overflow-hidden px-[5px]"
              style={{
                background: segment.bg,
                borderLeft: `2px solid ${segment.border}`,
                borderRight: `2px solid ${segment.border}`,
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
            >
              <span className="font-mono text-[7.5px] leading-[1.4] font-semibold whitespace-nowrap" style={{ color: segment.text }}>
                {segment.label}
              </span>
              <span className="font-mono text-[7px] leading-[1.4] whitespace-nowrap" style={{ color: `${segment.text}aa` }}>
                {segment.sub}
              </span>
            </div>
          ))}

          <div className="pointer-events-none absolute top-0 bottom-0 z-[4] w-[1.5px]" style={{ background: accent, left: `${progress * 100}%` }} />
        </div>

        <div className="flex justify-between border-t border-[rgba(0,0,0,0.06)] bg-[#f4f4f4] px-1 py-[3px]">
          {timeMarks.map((time, index) => (
            <span key={time} className="font-mono text-[8px]" style={{ color: index % 3 === 0 ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.13)' }}>
              {index % 2 === 0 ? time : '·'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
