import type { SegmentEditSetting } from '../types/app';

const SEGMENT_EDIT_SETTINGS_KEY = 'editor-segment-edit-settings';
const DELETED_SEGMENT_IDS_KEY = 'editor-deleted-segment-ids';

function isSegmentEditSetting(value: unknown): value is SegmentEditSetting {
  if (!value || typeof value !== 'object') return false;

  const setting = value as Partial<SegmentEditSetting>;
  return typeof setting.segmentId === 'number' && typeof setting.speed === 'number' && typeof setting.muted === 'boolean';
}

function loadJsonArray<T>(key: string, isValidItem: (value: unknown) => value is T): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isValidItem) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJsonArray<T>(key: string, values: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // localStorage may be unavailable in restricted browser contexts.
  }
}

export function loadSegmentEditSettings(): SegmentEditSetting[] {
  return loadJsonArray(SEGMENT_EDIT_SETTINGS_KEY, isSegmentEditSetting);
}

export function saveSegmentEditSettings(settings: SegmentEditSetting[]): void {
  saveJsonArray(SEGMENT_EDIT_SETTINGS_KEY, settings);
}

export function loadDeletedSegmentIds(): number[] {
  return loadJsonArray(DELETED_SEGMENT_IDS_KEY, (value): value is number => typeof value === 'number');
}

export function saveDeletedSegmentIds(segmentIds: number[]): void {
  saveJsonArray(DELETED_SEGMENT_IDS_KEY, segmentIds);
}
