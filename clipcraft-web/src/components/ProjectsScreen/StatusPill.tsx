import { useTheme } from '../../App';
import type { ProjectStatus } from '../../types/pages/ProjectsScreen';

const STATUS_META: Record<ProjectStatus, { bg: string; dot: string; fg: string; ko: string }> = {
  completed: { ko: '완료', dot: '#10b981', bg: 'rgba(16,185,129,0.10)', fg: '#067f5b' },
  editing: { ko: '편집중', dot: 'accent', bg: 'accentTint', fg: 'accent' },
  analyzing: { ko: '분석중', dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)', fg: '#a4660a' },
  draft: { ko: '초안', dot: 'rgba(0,0,0,0.35)', bg: 'rgba(0,0,0,0.05)', fg: 'rgba(0,0,0,0.55)' },
  failed: { ko: '실패', dot: '#ef4444', bg: 'rgba(239,68,68,0.10)', fg: '#b91c1c' },
};

export default function StatusPill({ status }: { status: ProjectStatus }) {
  const { accent } = useTheme();
  const meta = STATUS_META[status];
  const resolve = (value: string) => {
    if (value === 'accent') return accent;
    if (value === 'accentTint') return `${accent}18`;
    return value;
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full py-[3px] pr-[9px] pl-2 text-[11px] font-medium tracking-[-0.05px]"
      style={{ background: resolve(meta.bg), color: resolve(meta.fg) }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: resolve(meta.dot) }} />
      {meta.ko}
    </span>
  );
}
