import MonoLabel from '../MonoLabel';
import PillButton from '../PillButton';

interface ProjectsPageHeaderProps {
  count: number;
  onNewProject: () => void;
}

export default function ProjectsPageHeader({ count, onNewProject }: ProjectsPageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
      <div>
        <MonoLabel className="mb-3 block">My Workspace · {count} projects</MonoLabel>
        <h1 className="mb-2 text-[42px] leading-[1.1] font-[620] tracking-[-1.2px] max-[520px]:text-[34px]">내 프로젝트</h1>
        <p className="text-[14.5px] leading-[1.55] tracking-[-0.15px] text-[rgba(0,0,0,0.45)]">
          작업 중인 영상을 이어서 편집하고, 새 프로젝트를 시작해보세요.
        </p>
      </div>
      <PillButton icon="plus" onClick={onNewProject} variant="accent">
        새 프로젝트
      </PillButton>
    </div>
  );
}