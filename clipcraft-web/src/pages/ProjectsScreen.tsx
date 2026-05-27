import { useMemo, useRef, useState } from 'react';
import DeleteProjectModal from '../components/ProjectsScreen/DeleteProjectModal';
import EmptySearchState from '../components/ProjectsScreen/EmptySearchState';
import NewProjectCard from '../components/ProjectsScreen/NewProjectCard';
import NewProjectModal from '../components/ProjectsScreen/NewProjectModal';
import ProjectCard from '../components/ProjectsScreen/ProjectCard';
import ProjectFilterTabs from '../components/ProjectsScreen/ProjectFilterTabs';
import ProjectRow, { ProjectListHeader } from '../components/ProjectsScreen/ProjectRow';
import ProjectsPageHeader from '../components/ProjectsScreen/ProjectsPageHeader';
import ProjectsToolbar from '../components/ProjectsScreen/ProjectsToolbar';
import ProjectsTopNav from '../components/ProjectsScreen/ProjectsTopNav';
import Toast from '../components/ProjectsScreen/Toast';
import { initialProjects, projectPalettes } from '../components/ProjectsScreen/projectData';
import type { ProjectFilter, ProjectItem, ProjectSort, ProjectsView, ToastState } from '../types/pages/ProjectsScreen';

interface ProjectsScreenProps {
  onStartNewProject: () => void;
}

export default function ProjectsScreen({ onStartNewProject }: ProjectsScreenProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [view, setView] = useState<ProjectsView>('grid');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');
  const [sort, setSort] = useState<ProjectSort>('updated');
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const undoRef = useRef<{ index: number; project: ProjectItem } | null>(null);

  const filteredProjects = useMemo(() => {
    let list = projects.filter((project) => project.title.toLowerCase().includes(query.toLowerCase()));

    if (activeFilter === 'starred') list = list.filter((project) => project.starred);
    else if (activeFilter !== 'all') list = list.filter((project) => project.status === activeFilter);

    if (sort === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    return list;
  }, [activeFilter, projects, query, sort]);

  const counts = useMemo(
    () => ({
      all: projects.length,
      starred: projects.filter((project) => project.starred).length,
      editing: projects.filter((project) => project.status === 'editing').length,
      completed: projects.filter((project) => project.status === 'completed').length,
      analyzing: projects.filter((project) => project.status === 'analyzing').length,
      draft: projects.filter((project) => project.status === 'draft').length,
    }),
    [projects],
  );

  const filterTabs = [
    { id: 'all' as const, label: '전체', count: counts.all },
    { id: 'starred' as const, label: '즐겨찾기', count: counts.starred },
    { id: 'editing' as const, label: '편집중', count: counts.editing },
    { id: 'completed' as const, label: '완료', count: counts.completed },
    { id: 'analyzing' as const, label: '분석중', count: counts.analyzing },
    { id: 'draft' as const, label: '초안', count: counts.draft },
  ];

  const openProject = (project: ProjectItem) => {
    if (project.status === 'draft') {
      onStartNewProject();
      return;
    }

    setToast({
      icon: project.status === 'analyzing' ? 'clock' : project.status === 'failed' ? 'trash' : 'check',
      message:
        project.status === 'analyzing'
          ? `"${project.title}" 열기는 분석 완료 후 가능해요`
          : project.status === 'failed'
            ? `"${project.title}" 프로젝트는 다시 생성이 필요해요`
            : `"${project.title}" 샘플 프로젝트를 선택했어요`,
    });
  };

  const deleteProject = (project: ProjectItem) => {
    undoRef.current = { project, index: projects.findIndex((item) => item.id === project.id) };
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setDeleteTarget(null);
    setToast({
      icon: 'trash',
      message: `"${project.title}" 삭제됨`,
      action: {
        label: '실행 취소',
        onClick: () => {
          const undo = undoRef.current;
          if (!undo) return;

          setProjects((current) => {
            const next = [...current];
            next.splice(undo.index, 0, undo.project);
            return next;
          });
          setToast(null);
          undoRef.current = null;
        },
      },
      duration: 5000,
    });
  };

  const duplicateProject = (project: ProjectItem) => {
    const duplicate: ProjectItem = {
      ...project,
      id: `p${Date.now()}`,
      starred: false,
      title: `${project.title} 복사본`,
      updated: '방금 전',
    };

    setProjects((current) => [duplicate, ...current]);
    setToast({ icon: 'copy', message: `"${project.title}" 복제됨` });
  };

  const toggleStar = (project: ProjectItem) => {
    setProjects((current) => current.map((item) => (item.id === project.id ? { ...item, starred: !item.starred } : item)));
  };

  const renameProject = (project: ProjectItem) => {
    const nextName = window.prompt('새 이름', project.title);
    if (!nextName?.trim() || nextName.trim() === project.title) return;

    setProjects((current) => current.map((item) => (item.id === project.id ? { ...item, title: nextName.trim(), updated: '방금 전' } : item)));
    setToast({ icon: 'check', message: '이름이 변경되었어요' });
  };

  const createProject = ({ format, name }: { format: string; name: string }) => {
    const project: ProjectItem = {
      id: `p${Date.now()}`,
      title: name,
      status: 'draft',
      duration: '—',
      exported: null,
      scenes: 0,
      format,
      sizeMB: 0,
      palette: projectPalettes[Math.floor(Math.random() * projectPalettes.length)],
      updated: '방금 전',
      starred: false,
    };

    setProjects((current) => [project, ...current]);
    setNewOpen(false);
    setToast({ icon: 'check', message: '프로젝트가 생성됐어요. 영상을 업로드해보세요!' });
  };

  const actionHandlers = {
    onDelete: setDeleteTarget,
    onDuplicate: duplicateProject,
    onOpen: openProject,
    onRename: renameProject,
    onToggleStar: toggleStar,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <ProjectsTopNav />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-10 pt-9 pb-20 max-[760px]:px-5">
        <ProjectsPageHeader count={projects.length} onNewProject={() => setNewOpen(true)} />
        <ProjectsToolbar onQueryChange={setQuery} onSortChange={setSort} onViewChange={setView} query={query} sort={sort} view={view} />
        <ProjectFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} tabs={filterTabs} />

        {filteredProjects.length === 0 && query ? (
          <EmptySearchState onClear={() => setQuery('')} query={query} />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            <NewProjectCard onClick={() => setNewOpen(true)} />
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} {...actionHandlers} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white p-2">
            <ProjectListHeader />
            {filteredProjects.map((project) => (
              <ProjectRow key={project.id} project={project} {...actionHandlers} />
            ))}
          </div>
        )}
      </main>

      {deleteTarget && <DeleteProjectModal onCancel={() => setDeleteTarget(null)} onConfirm={deleteProject} project={deleteTarget} />}
      {newOpen && <NewProjectModal onCancel={() => setNewOpen(false)} onCreate={createProject} />}
      <Toast onDismiss={() => setToast(null)} toast={toast} />
    </div>
  );
}
