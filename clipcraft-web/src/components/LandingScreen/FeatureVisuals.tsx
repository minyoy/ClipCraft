import type { ReactNode } from 'react';
import Icon from '../Icon';
import { icons } from '../icons';
import { cn } from '../../lib/cn';
import { featureBars, heroSegments, highlights, monoClass } from './landingData';
import type { FeatureVisualType } from './landingData';
import { MonoLabel } from './LandingPrimitives';

function SearchVisual() {
  return (
    <VisualCard label="SCENARIO INPUT">
      <div className="flex items-center gap-[11px] rounded-full border border-black/15 px-[18px] py-[13px] text-[#5B4CF5]">
        <Icon d={icons.search} size={18} strokeWidth={1.8} />
        <span className="text-[14.5px] font-[480] tracking-[-0.1px] text-black">물을 붓고 끓이기 시작하는 순간 <i className="ml-0.5 inline-block h-4 w-0.5 animate-[caretBlink_1.6s_steps(1,end)_infinite] bg-[#5B4CF5] align-middle" /></span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['#끓이기', '#물 붓기', '#조리 시작', '#액션'].map((chip) => <span className="rounded-full bg-[#5B4CF514] px-[13px] py-[7px] text-[12.5px] font-[480] tracking-[-0.1px] text-[#4536d4]" key={chip}>{chip}</span>)}
      </div>
      <p className="mt-4 text-[13px] font-[320] leading-[1.5] tracking-[-0.2px] text-black/40">AI가 문장의 의미를 분석해 검색 의도를 이해했습니다.</p>
    </VisualCard>
  );
}

function CandidatesVisual() {
  return (
    <VisualCard label="RECOMMENDED" right="3 CLIPS">
      {highlights.map((item) => (
        <div className="mt-[9px] first:mt-0 flex items-center gap-3 rounded-[10px] border border-black/[0.08] px-3.5 py-3" key={item.title}>
          <span className={cn(monoClass, 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white')} style={{ background: item.color }}>{item.no}</span>
          <span className="min-w-0 flex-1"><strong className="block text-[14.5px] font-[480] tracking-[-0.1px]">{item.title}</strong><small className={cn(monoClass, 'mt-0.5 block text-[11px] text-black/40')}>{item.time}</small></span>
        </div>
      ))}
    </VisualCard>
  );
}

function TimelineVisual() {
  return (
    <VisualCard label="TIMELINE" right="15:00">
      <div className="overflow-hidden rounded-[10px] border border-black/[0.08]">
        <div className="relative flex h-[78px] items-center gap-0.5 p-1.5">
          {featureBars.map((height, index) => <span className="flex-1 rounded-px bg-black/10" key={index} style={{ height }} />)}
          {heroSegments.map((segment, index) => (
            <i className="absolute bottom-1.5 top-1.5 rounded-md border-l-2" key={segment.label} style={{ left: `${segment.left}%`, width: `${segment.width}%`, background: `${segment.color}26`, borderLeftColor: segment.color }}>
              <b className={cn(monoClass, 'absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold not-italic text-white')} style={{ background: segment.color }}>{index + 1}</b>
            </i>
          ))}
        </div>
        <div className={cn(monoClass, 'flex justify-between border-t border-black/[0.08] bg-[#f6f6f5] px-2 py-1 text-[9px] text-black/40')}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>15:00</span>
        </div>
      </div>
      <p className="mt-4 text-[13px] font-[320] leading-[1.5] tracking-[-0.2px] text-black/40">추천 구간이 타임라인 위에 색으로 표시되어 전체 흐름 속 위치를 한눈에 확인합니다.</p>
    </VisualCard>
  );
}

function ChatVisual() {
  return (
    <VisualCard label="AI ASSISTANT">
      <div className="flex flex-col gap-3.5">
        <div className="flex gap-2.5">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-black/[0.07] text-[11px] font-bold text-black/70">나</span>
          <p className="m-0 text-[14px] leading-[1.55]"><b className="mb-1 block text-[11px] text-black/30">나</b>끓이는 부분을 2배속으로 빨라지게 해줘.</p>
        </div>
        <div className="flex gap-2.5">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#5B4CF5] text-white"><Icon d={icons.bot} size={14} /></span>
          <p className="m-0 flex-1 text-[14px] leading-[1.55]">
            <b className="mb-1 block text-[11px] text-black/30">어시스턴트</b>
            끓이는 구간을 찾았어요.
            <small className="mt-1.5 block text-[12.5px] text-black/55">· 감지된 구간 · 02:14 - 04:47</small>
            <small className="mt-1.5 block text-[12.5px] text-black/55">· 이 구간에 2배속을 적용합니다.</small>
            <em className="mt-2.5 inline-flex rounded-full bg-[#5B4CF514] px-3 py-[5px] text-[11.5px] font-[480] tracking-[-0.1px] not-italic text-[#4536d4]">확인 대기 중</em>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-black/15 py-2 pl-4 pr-2">
        <span className="flex-1 text-[13px] text-black/30">AI에게 편집을 요청하세요...</span>
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#5B4CF5] text-white"><Icon d={icons.send} size={14} /></span>
      </div>
    </VisualCard>
  );
}

function VisualCard({ label, right, children }: { label: string; right?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-black/15 bg-white p-[22px] shadow-[0_2px_4px_rgba(0,0,0,0.03),0_24px_56px_-28px_rgba(0,0,0,0.24)]">
      <div className="mb-4 flex items-center gap-2">
        <MonoLabel className="text-[11px]">{label}</MonoLabel>
        {right && <MonoLabel className="ml-auto text-[11px]">{right}</MonoLabel>}
      </div>
      {children}
    </div>
  );
}

export default function FeatureVisual({ type }: { type: FeatureVisualType }) {
  if (type === 'search') return <SearchVisual />;
  if (type === 'candidates') return <CandidatesVisual />;
  if (type === 'timeline') return <TimelineVisual />;
  return <ChatVisual />;
}
