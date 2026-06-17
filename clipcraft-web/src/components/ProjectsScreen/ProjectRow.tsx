import { useTheme } from '@/App';
import Icon from '@/components/Icon';
import MonoLabel from '@/components/MonoLabel';
import { icons } from '@/components/icons';
import ProjectActionMenu from '@/components/ProjectsScreen/ProjectActionMenu';
import ProjectThumbnail from '@/components/ProjectsScreen/ProjectThumbnail';
import StatusPill from '@/components/ProjectsScreen/StatusPill';
import { formatProjectSize } from '@/lib/formatters';
import type { ProjectActionHandlers, ProjectItem } from '@/types/pages/ProjectsScreen';

interface ProjectRowProps extends ProjectActionHandlers {
  project: ProjectItem;
}

export function ProjectListHeader() {
  return (
    <div className="grid grid-cols-[120px_1fr_110px_90px_110px_110px_48px] items-center gap-4 border-b border-[rgba(0,0,0,0.06)] px-4 py-2 max-[980px]:hidden">
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Thumbnail</MonoLabel>
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Project</MonoLabel>
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Status</MonoLabel>
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Length</MonoLabel>
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Exported</MonoLabel>
      <MonoLabel className="justify-self-center text-center text-[9.5px]">Updated</MonoLabel>
      <span />
    </div>
  );
}

export default function ProjectRow({ onDelete, onDuplicate, onOpen, onRename, onToggleStar, project }: ProjectRowProps) {
  const { accent } = useTheme();

  return (
    <div
      className="grid cursor-pointer grid-cols-[120px_1fr_110px_90px_110px_110px_48px] items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-all hover:border-[rgba(0,0,0,0.1)] hover:bg-white max-[980px]:grid-cols-[96px_1fr_40px] max-[980px]:gap-3"
      onClick={() => onOpen(project)}
    >
      <div className="w-[120px] justify-self-center max-[980px]:w-24">
        <ProjectThumbnail project={project} />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {project.starred && <Icon d={icons.star} fill={accent} size={12} stroke={accent} strokeWidth={1} />}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[14.5px] font-[540] tracking-[-0.2px]">{project.title}</span>
        </div>
        <span className="font-mono text-[11.5px] text-[rgba(0,0,0,0.4)]">
          {project.scenes}개 장면 · {project.format} · {formatProjectSize(project.sizeMB)}
        </span>
      </div>
      <div className="justify-self-center max-[980px]:hidden">
        <StatusPill status={project.status} />
      </div>
      <span className="justify-self-center text-center font-mono text-[12.5px] text-[rgba(0,0,0,0.55)] max-[980px]:hidden">{project.duration}</span>
      <span className="justify-self-center text-center font-mono text-[12.5px] font-medium max-[980px]:hidden" style={{ color: project.exported ? accent : 'rgba(0,0,0,0.3)' }}>
        {project.exported || '—'}
      </span>
      <span className="flex items-center justify-self-center gap-1.5 text-[12.5px] text-[rgba(0,0,0,0.5)] max-[980px]:hidden">
        <Icon d={icons.clock} size={11} stroke="rgba(0,0,0,0.4)" />
        {project.updated}
      </span>
      <ProjectActionMenu onDelete={onDelete} onDuplicate={onDuplicate} onRename={onRename} onToggleStar={onToggleStar} project={project} />
    </div>
  );
}
