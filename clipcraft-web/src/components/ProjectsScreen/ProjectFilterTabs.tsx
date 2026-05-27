import Icon from '../Icon';
import { icons } from '../icons';
import type { ProjectFilter } from '../../types/pages/ProjectsScreen';

interface FilterTab {
  count: number;
  id: ProjectFilter;
  label: string;
}

interface ProjectFilterTabsProps {
  activeFilter: ProjectFilter;
  tabs: FilterTab[];
  onChange: (filter: ProjectFilter) => void;
}

export default function ProjectFilterTabs({ activeFilter, onChange, tabs }: ProjectFilterTabsProps) {
  return (
    <div className="mb-[22px] flex flex-wrap gap-1.5">
      {tabs.map((tab) => {
        const active = activeFilter === tab.id;
        return (
          <button
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-full px-3.5 py-[7px] text-[12.5px] font-medium tracking-[-0.1px] transition-all"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: active ? '#000' : 'transparent',
              border: active ? '1px solid transparent' : '1px solid rgba(0,0,0,0.1)',
              color: active ? '#fff' : 'rgba(0,0,0,0.55)',
            }}
            type="button"
          >
            {tab.id === 'starred' && <Icon d={icons.star} fill={active ? '#fff' : 'none'} size={11} stroke={active ? '#fff' : 'rgba(0,0,0,0.45)'} strokeWidth={1.5} />}
            {tab.label}
            <span
              className="rounded-full px-[7px] py-px font-mono text-[10.5px]"
              style={{
                background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                color: active ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)',
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
