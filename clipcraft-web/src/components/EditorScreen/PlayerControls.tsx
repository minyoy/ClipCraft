import type { MouseEvent } from 'react';
import Icon from '../Icon';
import { icons } from '../icons';
import { cn } from '../../lib/cn';
import type { PlayerControlsProps } from '../../types/pages/EditorScreen';
import RoundIconButton from './RoundIconButton';

function formatSeconds(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function getScrubPosition(event: MouseEvent | globalThis.MouseEvent, element: HTMLDivElement) {
  const rect = element.getBoundingClientRect();
  return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
}

export default function PlayerControls({
  accent,
  dragging,
  duration,
  muted,
  onSeekForward,
  onToggleMute,
  playing,
  progress,
  scrubberRef,
  setDragging,
  setPlaying,
  setProgress,
}: PlayerControlsProps) {
  const onScrubberMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    setDragging(true);
    setPlaying(false);
    setProgress(getScrubPosition(event, scrubberRef.current));
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 pt-3.5">
        <button
          onClick={() => setPlaying(!playing)}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0"
          style={{ background: accent }}
          type="button"
        >
          <Icon d={playing ? icons.pause : icons.play} size={13} stroke="#fff" fill="#fff" />
        </button>
        <RoundIconButton ariaLabel="10초 뒤로 이동" icon="skip" onClick={onSeekForward} />
        <RoundIconButton active={!muted} ariaLabel={muted ? '소리 켜기' : '소리 끄기'} icon={muted ? 'volOff' : 'vol'} onClick={onToggleMute} />
        <span className="font-mono text-[11px] text-[rgba(0,0,0,0.38)]">{formatSeconds(progress * duration)} / {formatSeconds(duration)}</span>
      </div>

      <div
        ref={scrubberRef}
        onMouseDown={onScrubberMouseDown}
        className={cn('relative mt-2.5 flex h-3.5 shrink-0 items-center', dragging ? 'cursor-grabbing' : 'cursor-pointer')}
      >
        <div className="absolute right-0 left-0 h-[3px] rounded-sm bg-[rgba(0,0,0,0.07)]">
          <div className="h-full rounded-sm" style={{ background: accent, transition: dragging ? 'none' : 'width 0.1s', width: `${progress * 100}%` }} />
        </div>
        <div
          className="absolute top-1/2 cursor-grab rounded-full"
          style={{
            background: accent,
            boxShadow: `0 0 0 3px ${accent}30`,
            height: dragging ? 14 : 11,
            left: `${progress * 100}%`,
            transform: 'translate(-50%, -50%)',
            transition: dragging ? 'none' : 'all 0.1s',
            width: dragging ? 14 : 11,
          }}
        />
      </div>
    </>
  );
}
