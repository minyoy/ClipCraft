import type { RefObject } from 'react';

interface VideoPreviewProps {
  onEnded?: () => void;
  onLoadedMetadata?: () => void;
  onTimeUpdate?: () => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  videoUrl?: string;
}

export default function VideoPreview({ onEnded, onLoadedMetadata, onTimeUpdate, videoRef, videoUrl }: VideoPreviewProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="relative h-full max-h-full aspect-[9/16] overflow-hidden rounded-[10px] bg-[#0a0500]">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            src={videoUrl}
            playsInline
            preload="metadata"
            onEnded={onEnded}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(160deg,#0f0700_0px,#0f0700_10px,#1e0e00_10px,#1e0e00_20px)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="font-mono text-[9px] tracking-[1px] text-[rgba(255,255,255,0.15)] uppercase">video preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute right-0 bottom-2.5 left-0 text-center">
          <span className="rounded bg-black/50 px-2 py-0.5 font-mono text-[9px] text-white/60">9:16 · Vertical / Shorts</span>
        </div>
      </div>
    </div>
  );
}
