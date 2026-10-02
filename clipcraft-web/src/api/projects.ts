import { requestApiV1 } from '@/api/v1Client';

export interface ApiProject {
  id: string;
  title: string;
  status: 'analyzing' | 'completed' | 'draft' | 'editing' | 'failed';
  format: string;
  source_duration_seconds: number | null;
  exported_duration_seconds: number | null;
  scene_count: number;
  source_size_bytes: number | null;
  starred: boolean;
  preview_url: string | null;
  analysis_progress: number | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ProjectPatchInput {
  version: number;
  title?: string;
  starred?: boolean;
  format?: string;
}

export async function listProjects(accessToken: string): Promise<ApiProject[]> {
  const { data } = await requestApiV1<ApiProject[]>('/projects?page_size=100', {}, accessToken);
  return data;
}

export async function createProject(accessToken: string, input: { title: string; format: string }): Promise<ApiProject> {
  const { data } = await requestApiV1<ApiProject>('/projects', { method: 'POST', body: JSON.stringify(input) }, accessToken);
  return data;
}

export async function patchProject(accessToken: string, projectId: string, input: ProjectPatchInput): Promise<ApiProject> {
  const { data } = await requestApiV1<ApiProject>(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(input) }, accessToken);
  return data;
}

export async function deleteProject(accessToken: string, projectId: string, version: number): Promise<void> {
  await requestApiV1<void>(`/projects/${projectId}?version=${version}`, { method: 'DELETE' }, accessToken);
}

export async function restoreProject(accessToken: string, projectId: string, deletedVersion: number): Promise<ApiProject> {
  const { data } = await requestApiV1<ApiProject>(
    `/projects/${projectId}/restore`,
    { method: 'POST', body: JSON.stringify({ deleted_version: deletedVersion }) },
    accessToken,
  );
  return data;
}

export async function duplicateProject(accessToken: string, projectId: string, title?: string): Promise<ApiProject> {
  const { data } = await requestApiV1<ApiProject>(
    `/projects/${projectId}/duplicate`,
    { method: 'POST', body: JSON.stringify(title ? { title } : {}) },
    accessToken,
  );
  return data;
}
