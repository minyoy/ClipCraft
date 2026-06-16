import Logo from '../Logo';
import { cn } from '../../lib/cn';
import { wrapClass } from './landingData';
import { LandingButton } from './LandingPrimitives';

export default function LandingHeader({ onLogin, onStart }: { onLogin: () => void; onStart: () => void }) {
  return (
    <header className="sticky top-0 z-[100] h-16 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
      <div className={cn(wrapClass, 'flex h-16 items-center')}>
        <button className="cursor-pointer border-0 bg-transparent" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} type="button" aria-label="ClipCraft 홈">
          <Logo height={27} />
        </button>
        <nav className="ml-10 hidden items-center gap-[34px] md:flex">
          <a className="relative py-1 text-[13px] font-[480] tracking-[-0.1px] text-black/70 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition hover:text-black hover:after:scale-x-100" href="#features">기능</a>
          <a className="relative py-1 text-[13px] font-[480] tracking-[-0.1px] text-black/70 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition hover:text-black hover:after:scale-x-100" href="#usecase">활용 사례</a>
        </nav>
        <div className="ml-auto flex items-center gap-6">
          <button className="hidden cursor-pointer border-0 bg-transparent text-[13px] font-[480] tracking-[-0.1px] text-black/70 hover:text-black sm:block" onClick={onLogin} type="button">로그인</button>
          <LandingButton onClick={onStart}>지금 시작하기</LandingButton>
        </div>
      </div>
    </header>
  );
}
