import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import { icons } from '../icons';
import type { ProjectSort, ProjectsView } from '../../types/pages/ProjectsScreen';

interface ProjectsToolbarProps {
  onQueryChange: (query: string) => void;
  onSortChange: (sort: ProjectSort) => void;
  onViewChange: (view: ProjectsView) => void;
  query: string;
  sort: ProjectSort;
  view: ProjectsView;
}

export default function ProjectsToolbar({ onQueryChange, onSortChange, onViewChange, query, sort, view }: ProjectsToolbarProps) {
  return (
    <div className="mb-[18px] flex flex-wrap items-center gap-2.5 rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 py-2.5">
      <div className="flex min-w-60 flex-1 items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-2.5 py-1.5">
        <Icon d={icons.search} size={14} stroke="rgba(0,0,0,0.4)" />
        <input
          className="flex-1 border-0 bg-transparent text-[13.5px] tracking-[-0.1px] outline-none placeholder:text-[rgba(0,0,0,0.35)]"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="프로젝트 이름으로 검색..."
          value={query}
        />
        {query && (
          <button className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-0 bg-[rgba(0,0,0,0.1)]" onClick={() => onQueryChange('')} type="button">
            <Icon d={icons.close} size={10} stroke="rgba(0,0,0,0.6)" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-l border-[rgba(0,0,0,0.07)] pr-1.5 pl-3 max-[640px]:border-l-0 max-[640px]:pl-0">
        <MonoLabel className="text-[10px]">Sort</MonoLabel>
        <select
          className="cursor-pointer appearance-none rounded-lg border border-[rgba(0,0,0,0.1)] bg-white py-1.5 pr-[26px] pl-2.5 text-[12.5px] outline-none"
          onChange={(event) => onSortChange(event.target.value as ProjectSort)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundPosition: 'right 6px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '12px',
          }}
          value={sort}
        >
          <option value="updated">최근 수정순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div className="flex rounded-[9px] bg-[rgba(0,0,0,0.04)] p-[3px]">
        {[
          { view: 'grid' as const, icon: 'grid' as const },
          { view: 'list' as const, icon: 'list' as const },
        ].map((item) => (
          <button
            className="flex h-7 w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-0 transition-all"
            key={item.view}
            onClick={() => onViewChange(item.view)}
            style={{
              background: view === item.view ? '#fff' : 'transparent',
              boxShadow: view === item.view ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
            type="button"
          >
            <Icon d={icons[item.icon]} size={14} stroke={view === item.view ? '#000' : 'rgba(0,0,0,0.45)'} strokeWidth={view === item.view ? 1.8 : 1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
