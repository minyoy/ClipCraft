import type { ReactNode } from 'react';
import Logo from '@/components/Logo';

export default function AuthLayout({ children, onLogoClick }: { children: ReactNode; onLogoClick?: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.026) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, #000 18%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 18%, transparent 72%)',
        }}
      />
      <header className="relative z-10 flex justify-center px-6 py-6 max-[520px]:py-5">
        <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onLogoClick} type="button" aria-label="랜딩 화면으로 이동">
          <Logo height={30} />
        </button>
      </header>
      <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-8 pb-14 max-[520px]:px-4 max-[520px]:pt-4">
        <div className="w-full max-w-[480px] rounded-[22px] border border-black/[0.08] bg-white/95 px-8 pt-10 pb-8 shadow-[0_22px_60px_rgba(0,0,0,0.045),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-sm max-[520px]:rounded-[18px] max-[520px]:px-5 max-[520px]:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
