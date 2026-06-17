import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { monoClass, sectionTitleClass } from '@/components/LandingScreen/landingData';

export function MonoLabel({ children, strong = false, light = false, className = '' }: { children: ReactNode; strong?: boolean; light?: boolean; className?: string }) {
  return (
    <span className={cn(monoClass, 'text-[11px]', light ? 'text-white/85' : strong ? 'text-black' : 'text-black/40', className)}>
      {children}
    </span>
  );
}

export function LandingButton({
  children,
  variant = 'black',
  onClick,
}: {
  children: ReactNode;
  variant?: 'black' | 'white' | 'glass';
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-5 py-[11px] text-[14.5px] font-[480] tracking-[-0.14px] transition duration-200 hover:-translate-y-px',
        variant === 'black' && 'border-transparent bg-black text-white hover:bg-[#1c1c1c]',
        variant === 'white' && 'border-black/15 bg-white text-black hover:border-black/30 hover:bg-[#f3f3f2]',
        variant === 'glass' && 'border-white/40 bg-white/20 text-white hover:bg-white/30',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function SectionHead({ label, title, body, center = false }: { label: string; title: ReactNode; body?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-[760px]', center && 'mx-auto text-center')}>
      <MonoLabel>{label}</MonoLabel>
      <h2 className={cn(sectionTitleClass, 'mt-4 text-[26px] sm:text-[32px] lg:text-[38px]')}>{title}</h2>
      {body && <p className="mt-[18px] whitespace-pre-line text-[14px] font-[320] leading-[1.55] tracking-[-0.2px] text-black/55 sm:text-[14.5px]">{body}</p>}
    </div>
  );
}
