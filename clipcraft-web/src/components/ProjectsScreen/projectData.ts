import type { ProjectItem } from '../../types/pages/ProjectsScreen';
import bakingClassPreview from '../../assets/images/baking-class-preview.png';
import campingVlogPreview from '../../assets/images/camping-vlog-preview.png';
import lectureHighlightPreview from '../../assets/images/lecture-highlight-preview.png';
import teamRetrospectiveSummaryPreview from '../../assets/images/team-retrospective-summary-preview.png';

export const initialProjects: ProjectItem[] = [
  {
    id: 'p2',
    title: '주말 캠핑 브이로그',
    status: 'editing',
    duration: '12:48',
    exported: null,
    scenes: 12,
    format: '16:9',
    sizeMB: 1240,
    palette: ['#1c4632', '#7fa067', '#cdd9a2'],
    previewImage: campingVlogPreview,
    updated: '2시간 전',
    starred: false,
  },
  {
    id: 'p4',
    title: '강연 풀영상 → 하이라이트',
    status: 'completed',
    duration: '14:36',
    exported: '2:18',
    scenes: 14,
    format: '16:9',
    sizeMB: 2080,
    palette: ['#0f2340', '#2962c4', '#9bc1f5'],
    previewImage: lectureHighlightPreview,
    updated: '어제',
    starred: true,
  },
  {
    id: 'p6',
    title: 'Q4 팀 회고 미팅 요약',
    status: 'completed',
    duration: '13:54',
    exported: '2:45',
    scenes: 9,
    format: '16:9',
    sizeMB: 1812,
    palette: ['#34324a', '#7b6db0', '#c8c2e8'],
    previewImage: teamRetrospectiveSummaryPreview,
    updated: '04.24',
    starred: false,
  },
  {
    id: 'p8',
    title: '베이킹 클래스 OT',
    status: 'analyzing',
    duration: '09:20',
    exported: null,
    scenes: 0,
    format: '—',
    sizeMB: 0,
    palette: ['#7a3a3a', '#c97070', '#f4c4c4'],
    previewImage: bakingClassPreview,
    updated: '04.20',
    starred: false,
  },
];

export const projectPalettes: Array<ProjectItem['palette']> = [
  ['#7a1f0e', '#d96a2c', '#f4c95c'],
  ['#1c4632', '#7fa067', '#cdd9a2'],
  ['#2b2240', '#5849a8', '#a89fe0'],
  ['#0f2340', '#2962c4', '#9bc1f5'],
  ['#34324a', '#7b6db0', '#c8c2e8'],
];
