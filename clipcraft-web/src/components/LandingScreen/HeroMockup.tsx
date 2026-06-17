import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { icons } from '@/components/icons';
import { cn } from '@/lib/cn';
import { heroBars, heroSegments, highlights, mmss, monoClass } from '@/components/LandingScreen/landingData';
import kimchiPreview from '@/assets/images/kimchi-preview.png';
import kimchiPourBoil from '@/assets/images/kimchi-pour-boil.png';
import kimchiAddScene from '@/assets/images/kimchi-add-scene.png';
import kimchiServeBowl from '@/assets/images/kimchi-serve-bowl.png';

const segmentImages = [kimchiPourBoil, kimchiAddScene, kimchiServeBowl];
const segmentBoundaryMarkers = heroSegments.flatMap((segment) => [segment.left, segment.left + segment.width]);

export default function HeroMockup() {
  const [progress, setProgress] = useState(0.52);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 0.0022;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
    }, 70);
    return () => window.clearInterval(timer);
  }, [playing]);

  const progressPct = `${(progress * 100).toFixed(2)}%`;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-2.5 rounded border border-dashed border-black/55 sm:-inset-4" />
      {['-left-[22px] -top-[22px]', '-right-[22px] -top-[22px]', '-bottom-[22px] -left-[22px]', '-bottom-[22px] -right-[22px]'].map((pos) => (
        <span className={cn('absolute z-[4] hidden h-[11px] w-[11px] border-[1.5px] border-black bg-white sm:block', pos)} key={pos} />
      ))}

      <div className="overflow-hidden rounded-lg border border-black/15 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_28px_64px_-26px_rgba(0,0,0,0.28)]">
        <div className="flex h-[28px] items-center gap-[7px] border-b border-black/[0.08] bg-[#f6f6f5] px-[13px]">
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => <span className="h-[11px] w-[11px] rounded-full" key={color} style={{ background: color }} />)}
        </div>

        <div className="grid min-h-[300px] grid-cols-[200px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)]">
          <div className="flex flex-col items-left border-r border-black/[0.08] px-[11px] py-[13px]">
            <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-lg bg-black">
              <img className="h-full w-full object-cover" src={kimchiPreview} alt="김치찌개 영상 프리뷰" />
              <span className="absolute inset-0 bg-black/[0.08]" />
              <span className="absolute">
                <Icon d={icons.play} size={24} stroke="rgba(255,255,255,0.72)" />
              </span>
              <span className={cn(monoClass, 'absolute bottom-[7px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/50 px-[7px] py-0.5 text-[7px] text-white/70')}>9:16 · 세로형 숏폼</span>
            </div>
            <div className="mt-[11px] flex w-full items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5B4CF5] text-white">
                <Icon d={icons.play} size={9} fill="currentColor" stroke="none" />
              </div>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-black/40"><Icon d={icons.skip} size={9} /></span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-black/40"><Icon d={icons.vol} size={9} /></span>
            </div>
            <div
              className="relative mt-2.5 h-3 w-full cursor-pointer rounded-full before:absolute before:left-0 before:right-0 before:top-1/2 before:h-[3px] before:-translate-y-1/2 before:rounded-full before:bg-black/[0.08]"
            >
              <i className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#5B4CF5]" style={{ width: progressPct }} />
              <b className="absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B4CF5] shadow-[0_0_0_3px_rgba(91,76,245,0.2)]" style={{ left: progressPct }} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="border-b border-black/[0.08] px-3.5 py-3">
              <div className="mb-[9px] flex items-center justify-between">
                <span className={cn(monoClass, 'flex items-center gap-1.5 text-[8.5px] text-black/40')}><Icon d={icons.sparkles} size={11} />시나리오 하이라이트</span>
                <span className={cn(monoClass, 'text-[8.5px] text-black/40')}>15:00</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-[#f6f6f5]">
                <div className="relative h-5 border-b border-black/[0.08] bg-[#efeeed]">
                  {segmentBoundaryMarkers.map((left, index) => (
                    <span className={cn(monoClass, 'absolute top-1/2 flex h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#5B4CF5] text-[6.5px] font-bold text-white')} key={left} style={{ left: `${left}%` }}>{index + 1}</span>
                  ))}
                </div>
                <div className="relative flex h-[50px] items-center gap-px px-0.5 py-[3px]">
                  {heroBars.map((height, index) => (
                    <span className="flex-1 rounded-px" key={index} style={{ height, background: index / heroBars.length < progress ? 'rgba(91,76,245,0.55)' : 'rgba(0,0,0,0.10)' }} />
                  ))}
                  {heroSegments.map((segment) => (
                    <span
                      className="absolute bottom-0 top-0 flex flex-col justify-center overflow-hidden border-0 border-l-2 border-r-2 px-1 text-left"
                      key={segment.label}
                      style={{ left: `${segment.left}%`, width: `${segment.width}%`, background: segment.bg, borderLeftColor: segment.color, borderRightColor: segment.color, color: segment.text }}
                    >
                      <span className={cn(monoClass, 'whitespace-nowrap text-[6.5px] font-semibold leading-[1.4] tracking-normal')}>{segment.label}</span>
                      <small className={cn(monoClass, 'whitespace-nowrap text-[6px] leading-[1.4] tracking-normal')}>{segment.sub}</small>
                    </span>
                  ))}
                  <span className="absolute bottom-0 top-0 z-[4] w-[1.5px] bg-[#5B4CF5]" style={{ left: progressPct }} />
                </div>
                <div className={cn(monoClass, 'flex justify-between border-t border-black/[0.08] bg-[#efeeed] px-1.5 py-[3px] text-[6.5px] text-black/30')}>
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>15:00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-3.5 py-[11px]">
              {highlights.map((card) => (
                <article
                  className="flex overflow-hidden rounded-lg border border-black/[0.08] text-left"
                  key={card.title}
                >
                  <span className="relative w-11 shrink-0 overflow-hidden bg-black">
                    <img className="h-full w-full object-cover" src={segmentImages[card.seg]} alt="" />
                    <span className="absolute inset-0 bg-black/[0.06]" />
                    <i className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: card.color }} />
                  </span>
                  <span className="min-w-0 flex-1 px-2.5 py-[7px]" style={{ background: card.bg }}>
                    <span className="mb-[3px] flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-[480] tracking-[-0.1px]">
                      <b className={cn(monoClass, 'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[7px] text-white')} style={{ background: card.color }}>{card.no}</b>
                      {card.title}
                    </span>
                    <span className={cn(monoClass, 'block text-[8px] text-black/40')}>{card.time}</span>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
