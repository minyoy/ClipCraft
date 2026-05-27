import { useTheme } from '../../App';
import Logo from '../Logo';

export default function ProjectsTopNav() {
  const { accent } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-[rgba(0,0,0,0.06)] bg-[rgba(250,250,250,0.85)] px-10 py-3.5 backdrop-blur-xl max-[760px]:px-5">
      <Logo height={28} />
      <div className="flex-1" />
      <div className="flex items-center gap-2 max-[520px]:hidden">
        <span className="font-mono text-xs text-[rgba(0,0,0,0.4)]">2.4 / 20 GB</span>
        <div className="h-1 w-20 overflow-hidden rounded-full bg-[rgba(0,0,0,0.07)]">
          <div className="h-full w-[12%] rounded-full" style={{ background: accent }} />
        </div>
      </div>
      <button className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-xs font-semibold tracking-[-0.1px]" type="button">
        JM
      </button>
    </header>
  );
}
