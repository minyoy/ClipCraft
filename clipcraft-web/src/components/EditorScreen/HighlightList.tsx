import type { HighlightListProps } from '../../types/pages/EditorScreen';

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export default function HighlightList({ activeSegment, onSegmentClick, segments }: HighlightListProps) {
  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
      {segments.map((segment, index) => {
        const tints = ['#FFF8F0', '#F0FFF6', '#FFF0F0'];
        const borders = ['#F59E0B', '#10B981', '#EF4444'];
        const tint = tints[index % tints.length];
        const border = borders[index % borders.length];
        const isActive = activeSegment === index;
        const segmentTime = `${formatTime(segment.start)} - ${formatTime(segment.end)}`;

        return (
          <div
            key={`${segment.sourceId}-${segment.id}-${segment.scenario}-${segment.start}`}
            onClick={() => onSegmentClick(index)}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = border;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = isActive ? border : 'rgba(0,0,0,0.08)';
            }}
            className="flex cursor-pointer items-center overflow-hidden rounded-[10px] transition-all"
            style={{
              border: `1px solid ${isActive ? border : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isActive ? `0 2px 12px ${border}44` : 'none',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <div className="relative flex h-[62px] w-[72px] shrink-0 items-center justify-center bg-[repeating-linear-gradient(135deg,#1a0800_0px,#1a0800_4px,#2a1200_4px,#2a1200_8px)]">
              <span className="font-mono text-[7px] text-white/20 uppercase">clip</span>
              <div className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ background: border }} />
            </div>
            <div className="flex-1 px-3.5 py-2.5" style={{ background: tint }}>
              <div className="mb-1 flex items-center gap-[7px]">
                <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold text-white" style={{ background: border }}>
                  {segment.id}
                </span>
                <span className="text-[13px] font-[480] tracking-[-0.1px]">{segment.scenario}</span>
              </div>
              <span className="font-mono text-[11px] text-[rgba(0,0,0,0.38)]">{segmentTime}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
