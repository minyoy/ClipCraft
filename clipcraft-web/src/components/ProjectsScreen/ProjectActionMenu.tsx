import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import { icons, type IconName } from '../icons';
import type { ProjectActionHandlers, ProjectItem } from '../../types/pages/ProjectsScreen';

interface ProjectActionMenuProps extends Omit<ProjectActionHandlers, 'onOpen'> {
  project: ProjectItem;
}

interface MenuItem {
  disabled?: boolean;
  icon: IconName;
  label: string;
  onClick: () => void;
}

export default function ProjectActionMenu({ onDelete, onDuplicate, onRename, onToggleStar, project }: ProjectActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items: MenuItem[] = [
    { icon: 'edit', label: '이름 변경', onClick: () => onRename(project) },
    { icon: 'copy', label: '복제', onClick: () => onDuplicate(project) },
    { icon: 'star', label: project.starred ? '즐겨찾기 해제' : '즐겨찾기', onClick: () => onToggleStar(project) },
    { icon: 'download', label: '다운로드', onClick: () => undefined, disabled: !project.exported },
  ];

  return (
    <div className="relative justify-self-end" ref={menuRef}>
      <button
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border-0 transition-colors"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        style={{ background: open ? 'rgba(0,0,0,0.07)' : 'transparent' }}
        type="button"
      >
        <Icon d={icons.more} size={16} stroke="rgba(0,0,0,0.55)" strokeWidth={2} />
      </button>
      {open && (
        <div
          className="absolute top-[34px] right-0 z-10 min-w-[180px] animate-[fadeIn_0.14s_ease] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.05)]"
          onClick={(event) => event.stopPropagation()}
        >
          {items.map((item) => (
            <button
              className="flex w-full items-center gap-2.5 rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-[13px] tracking-[-0.1px] transition-colors hover:bg-[rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:text-[rgba(0,0,0,0.3)] disabled:hover:bg-transparent"
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              type="button"
            >
              <Icon d={icons[item.icon]} size={13} />
              {item.label}
            </button>
          ))}
          <div className="mx-1 my-[5px] h-px bg-[rgba(0,0,0,0.07)]" />
          <button
            className="flex w-full items-center gap-2.5 rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-[13px] tracking-[-0.1px] text-[#dc2626] transition-colors hover:bg-[rgba(220,38,38,0.06)]"
            onClick={() => {
              setOpen(false);
              onDelete(project);
            }}
            type="button"
          >
            <Icon d={icons.trash} size={13} stroke="#dc2626" />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
