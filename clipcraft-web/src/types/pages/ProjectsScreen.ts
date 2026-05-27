export type ProjectStatus = 'analyzing' | 'completed' | 'draft' | 'editing' | 'failed';
export type ProjectsView = 'grid' | 'list';
export type ProjectSort = 'name' | 'updated';
export type ProjectFilter = ProjectStatus | 'all' | 'starred';

export interface ProjectItem {
  duration: string;
  exported: string | null;
  format: string;
  id: string;
  palette: [string, string, string];
  progress?: number;
  scenes: number;
  sizeMB: number;
  starred: boolean;
  status: ProjectStatus;
  title: string;
  updated: string;
}

export interface ProjectActionHandlers {
  onDelete: (project: ProjectItem) => void;
  onDuplicate: (project: ProjectItem) => void;
  onOpen: (project: ProjectItem) => void;
  onRename: (project: ProjectItem) => void;
  onToggleStar: (project: ProjectItem) => void;
}

export interface ToastState {
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  icon?: 'check' | 'clock' | 'copy' | 'trash';
  message: string;
}
