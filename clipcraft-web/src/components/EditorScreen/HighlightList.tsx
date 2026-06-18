import { useState } from 'react';
import type { DragEvent } from 'react';
import type { HighlightListProps } from '@/types/pages/EditorScreen';

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function DragHandle() {
  return (
    <svg aria-hidden="true" width="12" height="18" viewBox="0 0 12 18" fill="none">
      {[3, 9].flatMap((x) =>
        [4, 9, 14].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.15} fill="currentColor" />
        )),
      )}
    </svg>
  );
}

export default function HighlightList({ activeSegment, onSegmentClick, onSegmentsReorder, segmentEditSettings, segments, thumbnails }: HighlightListProps) {
  const [draggingSegmentId, setDraggingSegmentId] = useState<number | null>(null);
  const [hoverSegmentId, setHoverSegmentId] = useState<number | null>(null);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, segmentId: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(segmentId));
    setDraggingSegmentId(segmentId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, segmentId: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (segmentId !== draggingSegmentId) setHoverSegmentId(segmentId);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();

    const draggedId = draggingSegmentId ?? Number(event.dataTransfer.getData('text/plain'));
    const fromIndex = segments.findIndex((segment) => segment.id === draggedId);

    if (fromIndex !== -1 && fromIndex !== targetIndex) {
      onSegmentsReorder(fromIndex, targetIndex);
    }

    setDraggingSegmentId(null);
    setHoverSegmentId(null);
  };

  const stopDragging = () => {
    setDraggingSegmentId(null);
    setHoverSegmentId(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
      {segments.map((segment, index) => {
        const tints = ['#FFF8F0', '#F0FFF6', '#FFF0F0'];
        const borders = ['#F59E0B', '#10B981', '#EF4444'];
        const tint = tints[index % tints.length];
        const border = borders[index % borders.length];
        const isActive = activeSegment === index;
        const editSetting = segmentEditSettings.find((setting) => setting.segmentId === segment.id);
        const hasEditBadge = Boolean(editSetting && (editSetting.speed !== 1 || editSetting.muted));
        const scoreLabel = typeof segment.score === 'number' ? `${Math.round(segment.score * 100)}%` : null;
        const isDragging = draggingSegmentId === segment.id;
        const isDragTarget = hoverSegmentId === segment.id && draggingSegmentId !== segment.id;

        return (
          <div
            data-active={isActive ? 'true' : 'false'}
            data-testid="result-card"
            draggable
            key={`${segment.sourceId}-${segment.id}-${segment.scenario}-${segment.start}`}
            onDragEnd={stopDragging}
            onDragOver={(event) => handleDragOver(event, segment.id)}
            onDragStart={(event) => handleDragStart(event, segment.id)}
            onDrop={(event) => handleDrop(event, index)}
            onClick={() => onSegmentClick(index)}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = border;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = isActive || isDragTarget ? border : 'rgba(0,0,0,0.08)';
            }}
            className="flex cursor-grab items-center overflow-hidden rounded-[10px] transition-all active:cursor-grabbing"
            style={{
              border: `1px solid ${isActive || isDragTarget ? border : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isActive || isDragTarget ? `0 2px 12px ${border}44` : 'none',
              opacity: isDragging ? 0.45 : 1,
              transform: isActive || isDragTarget ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <div className="flex w-8 shrink-0 items-center justify-center self-stretch bg-white text-black/20 transition-colors hover:text-black/45" aria-label="순서 변경 핸들">
              <DragHandle />
            </div>
            <div className="relative flex w-[72px] shrink-0 self-stretch items-center justify-center overflow-hidden bg-[repeating-linear-gradient(135deg,#1a0800_0px,#1a0800_4px,#2a1200_4px,#2a1200_8px)]">
              {thumbnails[segment.id] ? (
                <img className="absolute inset-0 h-full w-full object-cover" src={thumbnails[segment.id]} alt="" />
              ) : (
                <span className="font-mono text-[7px] text-white/20">클립</span>
              )}
              <div className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ background: border }} />
            </div>
            <div className="flex-1 px-3.5 py-2.5" style={{ background: tint }}>
              <div className="mb-1 flex items-center gap-[7px]">
                <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold text-white" style={{ background: border }}>
                  {index + 1}
                </span>
                <span className="text-[13px] font-[480] tracking-[-0.1px]">{segment.title ?? segment.scenario}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span data-testid="result-start-time" className="font-mono text-[11px] text-[rgba(0,0,0,0.38)]">{formatTime(segment.start)}</span>
                <span className="font-mono text-[11px] text-[rgba(0,0,0,0.24)]">-</span>
                <span data-testid="result-end-time" className="font-mono text-[11px] text-[rgba(0,0,0,0.38)]">{formatTime(segment.end)}</span>
                {scoreLabel && <span data-testid="result-score" className="font-mono text-[11px] text-[rgba(0,0,0,0.38)]">score {scoreLabel}</span>}
                {hasEditBadge && editSetting?.speed !== 1 && (
                  <span data-testid="playback-rate-indicator" className="rounded-full px-1.5 py-[1px] font-mono text-[9px] font-semibold" style={{ background: `${border}18`, color: border }}>
                    {editSetting?.speed}배속
                  </span>
                )}
                {hasEditBadge && editSetting?.muted && (
                  <span data-testid="mute-indicator" className="rounded-full bg-black/8 px-1.5 py-[1px] font-mono text-[9px] font-semibold text-black/55">음소거</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
