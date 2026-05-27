import { useTheme } from '../../App';
import MonoLabel from '../MonoLabel';
import Icon from '../Icon';
import { icons } from '../icons';
import ProjectActionMenu from './ProjectActionMenu';
import ProjectThumbnail from './ProjectThumbnail';
import StatusPill from './StatusPill';
import type { ProjectActionHandlers, ProjectItem } from '../../types/pages/ProjectsScreen';

function formatSize(sizeMB: number) {
  return sizeMB > 1000 ? `${(sizeMB / 1024).toFixed(1)} GB` : `${sizeMB} MB`;
}

interface ProjectCardProps extends ProjectActionHandlers {
  project: ProjectItem;
}

export default function ProjectCard({ onDelete, onDuplicate, onOpen, onRename, onToggleStar, project }: ProjectCardProps) {
  const { accent } = useTheme();

  return (
    <div
      className="group flex cursor-pointer animate-[fadeIn_0.25s_ease_both] flex-col overflow-hidden rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:border-[rgba(0,0,0,0.14)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]"
      onClick={() => onOpen(project)}
    >
      <div className="p-2.5 pb-0">
        <ProjectThumbnail project={project} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14.5px] leading-[1.3] font-[540] tracking-[-0.2px]">{project.title}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusPill status={project.status} />
              <span className="flex items-center gap-1 text-[11.5px] text-[rgba(0,0,0,0.4)]">
                <Icon d={icons.clock} size={10} stroke="rgba(0,0,0,0.4)" />
                {project.updated}
              </span>
            </div>
          </div>
          <ProjectActionMenu onDelete={onDelete} onDuplicate={onDuplicate} onRename={onRename} onToggleStar={onToggleStar} project={project} />
        </div>

        <div className="flex items-center gap-3 border-t border-[rgba(0,0,0,0.06)] pt-2.5">
          <div className="flex flex-col gap-0.5">
            <MonoLabel className="text-[9.5px]">장면</MonoLabel>
            <span className="font-mono text-[12.5px] font-medium">{project.scenes}</span>
          </div>
          <div className="h-[22px] w-px bg-[rgba(0,0,0,0.07)]" />
          <div className="flex flex-col gap-0.5">
            <MonoLabel className="text-[9.5px]">편집본</MonoLabel>
            <span className="font-mono text-[12.5px] font-medium" style={{ color: project.exported ? accent : 'rgba(0,0,0,0.3)' }}>
              {project.exported || '—'}
            </span>
          </div>
          <div className="h-[22px] w-px bg-[rgba(0,0,0,0.07)]" />
          <div className="flex flex-col gap-0.5">
            <MonoLabel className="text-[9.5px]">용량</MonoLabel>
            <span className="font-mono text-[12.5px] font-medium">{formatSize(project.sizeMB)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
