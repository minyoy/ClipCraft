import type { Dispatch, SetStateAction } from 'react';
import type { EditorHighlightSegment, SegmentEditSetting } from '../types/app';
import type { NaturalLanguageCommandResult } from '../types/pages/EditorScreen';

type SegmentEditPatch = Partial<Pick<SegmentEditSetting, 'muted' | 'speed'>>;

type NaturalLanguageCommandAction =
  | {
      type: 'edit';
      patch: SegmentEditPatch;
    }
  | {
      type: 'seek';
    }
  | {
      type: 'delete';
    };

const COMMAND_KEYWORDS = ['2배속', '2x', '원래 속도', '기본 속도', '1배속', '1x', '음소거', '소리 꺼', 'mute', '삭제', '빼줘', '제외', 'delete', 'remove', '보여줘', '이동', '찾아줘', 'show', 'go to', 'seek'];

const COMMAND_STOP_WORDS = new Set([
  'part',
  'segment',
  'speed',
  'to',
  'go',
  '구간',
  '구간으로',
  '부분',
  '부분으로',
  '장면',
  '장면으로',
  '해줘',
]);

interface ApplyEditorCommandOptions {
  activeSegment: number | null;
  command: string;
  playbackDuration: number;
  progress: number;
  seekToSegment: (segment: EditorHighlightSegment, index: number) => void;
  segments: EditorHighlightSegment[];
  setActiveSegment: Dispatch<SetStateAction<number | null>>;
  setDeletedSegmentIds: Dispatch<SetStateAction<number[]>>;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setSegmentEditSettings: Dispatch<SetStateAction<SegmentEditSetting[]>>;
  setSegments: Dispatch<SetStateAction<EditorHighlightSegment[]>>;
}

function getSegmentEditPatch(command: string): SegmentEditPatch | null {
  const patch: SegmentEditPatch = {};

  if (command.includes('2배속') || command.includes('2x')) {
    patch.speed = 2;
  } else if (command.includes('원래 속도') || command.includes('기본 속도') || command.includes('1배속') || command.includes('1x')) {
    patch.speed = 1;
  }

  if (command.includes('음소거') || command.includes('소리 꺼') || command.includes('mute')) {
    patch.muted = true;
  }

  return patch.speed !== undefined || patch.muted !== undefined ? patch : null;
}

function includesAny(command: string, keywords: string[]): boolean {
  return keywords.some((keyword) => command.includes(keyword));
}

function getNaturalLanguageCommandAction(command: string): NaturalLanguageCommandAction | null {
  const patch = getSegmentEditPatch(command);
  if (patch) return { type: 'edit', patch };

  if (includesAny(command, ['삭제', '빼줘', '제외', 'delete', 'remove'])) {
    return { type: 'delete' };
  }

  if (includesAny(command, ['보여줘', '이동', '찾아줘', 'show', 'go to', 'seek'])) {
    return { type: 'seek' };
  }

  return null;
}

function getTargetLabel(matchedSegments: EditorHighlightSegment[]): string {
  return matchedSegments.length === 1 ? matchedSegments[0].scenario : `${matchedSegments[0].scenario} 외 ${matchedSegments.length - 1}개`;
}

function getCommandSearchTokens(command: string): string[] {
  return command
    .split(/[\s,.;:!?'"“”]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .filter((token) => !COMMAND_STOP_WORDS.has(token))
    .filter((token) => !COMMAND_KEYWORDS.some((keyword) => token.includes(keyword)));
}

function findMatchingSegments(command: string, segments: EditorHighlightSegment[]): EditorHighlightSegment[] {
  const exactMatches = segments.filter((segment) => command.includes(segment.scenario.toLowerCase()));
  if (exactMatches.length > 0) return exactMatches;

  const searchTokens = getCommandSearchTokens(command);
  return segments.filter((segment) => {
    const scenario = segment.scenario.toLowerCase();
    return searchTokens.some((token) => scenario.includes(token));
  });
}

function applySegmentEditSettings(
  matchedSegments: EditorHighlightSegment[],
  patch: SegmentEditPatch,
  setSegmentEditSettings: Dispatch<SetStateAction<SegmentEditSetting[]>>,
): void {
  setSegmentEditSettings((current) => {
    const next = [...current];

    matchedSegments.forEach((segment) => {
      const currentIndex = next.findIndex((setting) => setting.segmentId === segment.id);
      const baseSetting: SegmentEditSetting = currentIndex >= 0 ? next[currentIndex] : { segmentId: segment.id, speed: 1, muted: false };
      const nextSetting = { ...baseSetting, ...patch };

      if (currentIndex >= 0) {
        next[currentIndex] = nextSetting;
        return;
      }

      next.push(nextSetting);
    });

    return next;
  });
}

function buildEditSuccessMessage(targetLabel: string, patch: SegmentEditPatch): string {
  if (patch.speed !== undefined && patch.muted) {
    return `“${targetLabel}”을 ${patch.speed}배속으로 변경하고 음소거했어요.`;
  }

  if (patch.speed !== undefined) {
    return patch.speed === 1 ? `“${targetLabel}”을 기본 속도로 변경했어요.` : `“${targetLabel}”을 ${patch.speed}배속으로 변경했어요.`;
  }

  return `“${targetLabel}”을 음소거했어요.`;
}

export function applyEditorNaturalLanguageCommand({
  activeSegment,
  command,
  playbackDuration,
  progress,
  seekToSegment,
  segments,
  setActiveSegment,
  setDeletedSegmentIds,
  setPlaying,
  setProgress,
  setSegmentEditSettings,
  setSegments,
}: ApplyEditorCommandOptions): NaturalLanguageCommandResult {
  const normalizedCommand = command.trim().toLowerCase();
  const action = getNaturalLanguageCommandAction(normalizedCommand);

  if (!action) {
    return { status: 'error', message: '지원하지 않는 편집 명령이에요.' };
  }

  const matchedSegments = findMatchingSegments(normalizedCommand, segments);

  if (matchedSegments.length === 0) {
    return { status: 'error', message: '해당 장면을 찾지 못했어요.' };
  }

  const targetLabel = getTargetLabel(matchedSegments);

  if (action.type === 'seek') {
    const targetIndex = segments.findIndex((segment) => segment.id === matchedSegments[0].id);
    if (targetIndex >= 0) seekToSegment(matchedSegments[0], targetIndex);

    return { status: 'success', message: `“${targetLabel}”으로 이동했어요.` };
  }

  if (action.type === 'delete') {
    const matchedIds = new Set(matchedSegments.map((segment) => segment.id));
    const remainingSegments = segments.filter((segment) => !matchedIds.has(segment.id));
    const currentTime = progress * playbackDuration;
    const isIndicatorInDeletedSegment = matchedSegments.some((segment) => currentTime >= segment.start && currentTime <= segment.end);
    const activeSegmentId = activeSegment !== null ? segments[activeSegment]?.id : null;
    const isActiveSegmentDeleted = activeSegmentId !== null && matchedIds.has(activeSegmentId);

    setSegments(remainingSegments);
    setSegmentEditSettings((current) => current.filter((setting) => !matchedIds.has(setting.segmentId)));
    setDeletedSegmentIds((current) => Array.from(new Set([...current, ...matchedIds])));

    if (isIndicatorInDeletedSegment || isActiveSegmentDeleted) {
      const fallbackSegment =
        remainingSegments.find((segment) => segment.start >= matchedSegments[0].start) ?? remainingSegments[remainingSegments.length - 1] ?? null;

      if (fallbackSegment) {
        const fallbackIndex = remainingSegments.findIndex((segment) => segment.id === fallbackSegment.id);
        seekToSegment(fallbackSegment, fallbackIndex);
      } else {
        setActiveSegment(null);
        setProgress(0);
        setPlaying(false);
      }
    } else if (activeSegmentId !== null) {
      const nextActiveIndex = remainingSegments.findIndex((segment) => segment.id === activeSegmentId);
      setActiveSegment(nextActiveIndex >= 0 ? nextActiveIndex : null);
    }

    return { status: 'success', message: `“${targetLabel}”을 삭제했어요.` };
  }

  applySegmentEditSettings(matchedSegments, action.patch, setSegmentEditSettings);

  return { status: 'success', message: buildEditSuccessMessage(targetLabel, action.patch) };
}
