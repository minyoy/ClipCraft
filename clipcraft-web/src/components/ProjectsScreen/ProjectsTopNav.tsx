import Logo from '@/components/Logo';

export default function ProjectsTopNav({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-[rgba(0,0,0,0.06)] bg-[rgba(250,250,250,0.85)] px-10 py-3.5 backdrop-blur-xl max-[760px]:px-5">
      <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onLogoClick} type="button" aria-label="랜딩 화면으로 이동">
        <Logo height={28} />
      </button>
      <div className="flex-1" />
      <button className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-xs font-semibold tracking-[-0.1px]" type="button">
        JM
      </button>
    </header>
  );
}
