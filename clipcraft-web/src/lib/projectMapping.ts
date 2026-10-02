import type { ApiProject } from '@/api/projects';
import { projectPalettes } from '@/components/ProjectsScreen/projectData';
import { formatDurationSeconds, formatRelativeTime } from '@/lib/formatters';
import type { ProjectItem } from '@/types/pages/ProjectsScreen';

function paletteForId(id: string): ProjectItem['palette'] {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;

  return projectPalettes[hash % projectPalettes.length];
}

export function toProjectItem(project: ApiProject): ProjectItem {
  return {
    duration: formatDurationSeconds(project.source_duration_seconds),
    exported: project.exported_duration_seconds !== null ? formatDurationSeconds(project.exported_duration_seconds) : null,
    format: project.format,
    id: project.id,
    palette: paletteForId(project.id),
    previewImage: project.preview_url ?? undefined,
    progress: project.analysis_progress ?? undefined,
    scenes: project.scene_count,
    sizeMB: project.source_size_bytes !== null ? Math.round(project.source_size_bytes / (1024 * 1024)) : 0,
    starred: project.starred,
    status: project.status,
    title: project.title,
    updated: formatRelativeTime(project.updated_at),
    version: project.version,
  };
}
