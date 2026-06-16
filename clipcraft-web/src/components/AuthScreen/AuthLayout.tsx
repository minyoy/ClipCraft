import type { ReactNode } from 'react';
import Logo from '../Logo';

export default function AuthLayout({ children, onLogoClick }: { children: ReactNode; onLogoClick?: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafafa]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
        }}
      />
      <header className="relative z-10 flex justify-center px-8 py-[18px]">
        <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onLogoClick} type="button" aria-label="랜딩 화면으로 이동">
          <Logo height={34} />
        </button>
      </header>
      <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-6 pb-[48px]">
        <div className="w-full max-w-[500px] rounded-[20px] border border-[rgba(0,0,0,0.05)] bg-white px-7 pt-9 pb-8 shadow-[0_30px_80px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03)] max-[520px]:px-5">
          {children}
        </div>
      </main>
    </div>
  );
}
