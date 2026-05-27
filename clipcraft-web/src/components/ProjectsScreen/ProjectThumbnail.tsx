import Icon from '../Icon';
import { icons } from '../icons';
import type { ProjectItem } from '../../types/pages/ProjectsScreen';

interface ProjectThumbnailProps {
  project: ProjectItem;
  ratio?: string;
}

export default function ProjectThumbnail({ project, ratio = '16 / 9' }: ProjectThumbnailProps) {
  const [a, b] = project.palette;
  const stripeAngle = (project.id.charCodeAt(1) * 13) % 180;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[10px]"
      style={{
        aspectRatio: ratio,
        background: a,
        backgroundImage: `repeating-linear-gradient(${stripeAngle}deg, ${a} 0px, ${a} 14px, ${b} 14px, ${b} 28px)`,
      }}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 60% 40%, transparent 30%, ${a}88 100%)` }} />
      <div className="absolute top-2.5 right-2.5 left-2.5 flex items-start justify-between gap-2">
        <span className="font-mono text-[9px] tracking-[1px] text-[rgba(255,255,255,0.55)] uppercase">video preview</span>
        {project.starred && <Icon d={icons.star} fill="#fff" size={12} stroke="#fff" strokeWidth={1} />}
      </div>

      {project.status !== 'analyzing' && project.status !== 'draft' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[rgba(0,0,0,0.45)] backdrop-blur">
            <Icon d={icons.play} fill="#fff" size={14} stroke="#fff" />
          </div>
        </div>
      )}

      {project.status === 'analyzing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[rgba(0,0,0,0.55)] backdrop-blur-[2px]">
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.5px] text-white">{project.progress ?? 0}% 분석중</span>
        </div>
      )}

      {project.status === 'draft' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
          <span className="font-mono text-[10px] tracking-[1px] text-[rgba(255,255,255,0.7)] uppercase">no video yet</span>
        </div>
      )}

      {project.duration !== '—' && <div className="absolute right-2 bottom-2 rounded bg-[rgba(0,0,0,0.65)] px-[7px] py-0.5 font-mono text-[10px] tracking-[0.3px] text-white">{project.duration}</div>}
      {project.format !== '—' && <div className="absolute bottom-2 left-2 rounded bg-[rgba(255,255,255,0.18)] px-[7px] py-0.5 font-mono text-[10px] tracking-[0.3px] text-white backdrop-blur-[3px]">{project.format}</div>}
    </div>
  );
}
