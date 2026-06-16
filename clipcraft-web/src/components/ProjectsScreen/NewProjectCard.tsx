import type { CSSProperties } from 'react';
import { useTheme } from '../../App';
import Icon from '../Icon';
import { icons } from '../icons';

export default function NewProjectCard({ onClick }: { onClick: () => void }) {
  const { accent } = useTheme();

  return (
    <button
      className="group flex cursor-pointer self-start animate-[fadeIn_0.25s_ease_both] flex-col overflow-hidden rounded-[14px] border-[1.5px] border-dashed outline-none transition-all hover:-translate-y-0.5"
      onClick={onClick}
      style={{ background: 'rgba(0,0,0,0.018)', borderColor: 'rgba(0,0,0,0.14)' }}
      type="button"
    >
      <div className="p-2.5 pb-0">
        <div className="flex aspect-video w-full items-center justify-center rounded-[10px] bg-white/70">
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[rgba(0,0,0,0.05)] text-black/40 transition-colors group-hover:bg-[var(--project-accent)] group-hover:text-white" style={{ '--project-accent': accent } as CSSProperties}>
            <Icon d={icons.plus} size={24} stroke="currentColor" strokeWidth={2} />
          </div>
        </div>
      </div>
      <div className="p-3.5 text-center">
        <div className="text-[15px] font-[540] tracking-[-0.2px] text-[rgba(0,0,0,0.7)] transition-colors group-hover:text-[var(--project-accent)]" style={{ '--project-accent': accent } as CSSProperties}>
          새 프로젝트 만들기
        </div>
        <div className="mt-1.5 text-xs leading-[1.5] tracking-[-0.1px] text-[rgba(0,0,0,0.4)]">영상 업로드부터 AI 편집까지</div>
      </div>
    </button>
  );
}
