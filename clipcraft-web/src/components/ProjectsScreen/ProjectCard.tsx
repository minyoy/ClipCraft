import Icon from '@/components/Icon';
import { icons } from '@/components/icons';
import ProjectActionMenu from '@/components/ProjectsScreen/ProjectActionMenu';
import ProjectThumbnail from '@/components/ProjectsScreen/ProjectThumbnail';
import StatusPill from '@/components/ProjectsScreen/StatusPill';
import type { ProjectActionHandlers, ProjectItem } from '@/types/pages/ProjectsScreen';

interface ProjectCardProps extends ProjectActionHandlers {
  project: ProjectItem;
}

export default function ProjectCard({ onDelete, onDuplicate, onOpen, onRename, onToggleStar, project }: ProjectCardProps) {
  return (
    <div
      className="group flex cursor-pointer self-start animate-[fadeIn_0.25s_ease_both] flex-col rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:border-[rgba(0,0,0,0.14)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]"
      onClick={() => onOpen(project)}
    >
      <div className="p-2.5 pb-0">
        <ProjectThumbnail project={project} />
      </div>
      <div className="flex flex-col gap-2.5 p-3.5">
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
      </div>
    </div>
  );
}
