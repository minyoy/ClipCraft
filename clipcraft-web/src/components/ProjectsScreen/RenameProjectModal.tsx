import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/App';
import Icon from '@/components/Icon';
import MonoLabel from '@/components/MonoLabel';
import PillButton from '@/components/PillButton';
import { icons } from '@/components/icons';
import type { ProjectItem } from '@/types/pages/ProjectsScreen';

interface RenameProjectModalProps {
  onCancel: () => void;
  onRename: (project: ProjectItem, title: string) => void;
  project: ProjectItem;
}

export default function RenameProjectModal({ onCancel, onRename, project }: RenameProjectModalProps) {
  const { accent } = useTheme();
  const [title, setTitle] = useState(project.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedTitle = title.trim();
  const canRename = trimmedTitle.length > 0 && trimmedTitle !== project.title;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 60);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex animate-[overlayIn_0.18s_ease] items-center justify-center bg-[rgba(0,0,0,0.32)] p-6 backdrop-blur" onClick={onCancel}>
      <div className="w-full max-w-[440px] animate-[modalIn_0.2s_cubic-bezier(0.16,1,0.3,1)] rounded-2xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-[22px] flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: `${accent}18` }}>
              <Icon d={icons.edit} size={17} stroke={accent} />
            </div>
            <div>
              <h3 className="text-[20px] font-[620] leading-[1.2] tracking-[-0.45px]">프로젝트 이름 변경</h3>
              <p className="mt-1 text-[13px] leading-[1.5] tracking-[-0.1px] text-black/45">프로젝트 목록과 편집 화면에서 표시될 이름을 수정합니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <MonoLabel className="mb-2 block">새 이름</MonoLabel>
          <input
            className="w-full rounded-[10px] border-[1.5px] border-[rgba(0,0,0,0.12)] px-3.5 py-3 text-sm tracking-[-0.1px] outline-none transition-colors focus:border-[var(--project-accent)]"
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canRename) onRename(project, trimmedTitle);
              if (event.key === 'Escape') onCancel();
            }}
            ref={inputRef}
            style={{ '--project-accent': accent } as CSSProperties}
            value={title}
          />
        </div>

        <div className="flex justify-end gap-2">
          <PillButton onClick={onCancel} small variant="glass">
            취소
          </PillButton>
          <PillButton disabled={!canRename} icon="check" onClick={() => onRename(project, trimmedTitle)} small variant="accent">
            변경
          </PillButton>
        </div>
      </div>
    </div>
  );
}
