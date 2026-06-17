export const PROJECT_FORMAT_OPTIONS = [
  { value: '9:16', label: '세로 9:16', description: 'Shorts · Reels' },
  { value: '16:9', label: '가로 16:9', description: 'YouTube · TV' },
  { value: '1:1', label: '정사각형 1:1', description: 'Instagram' },
] as const;

export function getProjectFormatLabel(format: string): string {
  return PROJECT_FORMAT_OPTIONS.find((option) => option.value === format)?.label ?? format;
}
