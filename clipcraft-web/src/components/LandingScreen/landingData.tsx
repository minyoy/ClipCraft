import type { ReactNode } from 'react';
import { icons } from '@/components/icons';

export const ACCENT = '#5B4CF5';
export const AMBER = '#F59E0B';
export const GREEN = '#10B981';
export const RED = '#EF4444';

export const wrapClass = 'mx-auto w-full max-w-[1200px] px-5 sm:px-8';
export const displayClass = 'font-[540] leading-[1.08] tracking-[-0.2px]';
export const sectionTitleClass = 'font-[540] leading-[1.08] tracking-[-0.2px]';
export const monoClass = 'font-mono font-normal uppercase tracking-[0.6px]';

export const heroBars = Array.from({ length: 60 }, (_, index) =>
  Math.min(42, 4 + Math.abs(Math.sin(index * 0.41 + 0.7) * 22) + Math.abs(Math.cos(index * 0.73) * 10)),
);

export const featureBars = Array.from({ length: 56 }, (_, index) =>
  Math.min(66, 6 + Math.abs(Math.sin(index * 0.4 + 0.6) * 38) + Math.abs(Math.cos(index * 0.7) * 14)),
);

export const heroSegments = [
  { left: 17, width: 12, color: AMBER, bg: 'rgba(254,243,199,0.85)', text: '#92400E', label: '물 붓고 끓이기', sub: '02:50 - 04:00' },
  { left: 41, width: 7, color: GREEN, bg: 'rgba(209,250,229,0.85)', text: '#065F46', label: '김치 넣는 장면', sub: '06:15 - 06:30' },
  { left: 80, width: 9, color: RED, bg: 'rgba(254,226,226,0.85)', text: '#991B1B', label: '국그릇에 담기', sub: '13:21 - 13:54' },
];

export const highlights = [
  { no: 2, title: '물 붓고 끓이기', time: '02:50 - 04:00', pos: 0.167, seg: 0, color: AMBER, bg: '#FFF8F0' },
  { no: 5, title: '김치 넣는 장면', time: '06:15 - 06:30', pos: 0.417, seg: 1, color: GREEN, bg: '#F0FFF6' },
  { no: 8, title: '국그릇에 담기', time: '13:21 - 13:54', pos: 0.833, seg: 2, color: RED, bg: '#FFF0F0' },
];

export const problems = [
  ['01', '끝없는 스크러빙', '원하는 장면을 찾으려 타임라인을 반복해 확인합니다. \n 영상이 길수록 탐색 시간은 편집 시간보다 더 크게 느껴집니다.', '영상보다 오래 걸리는 탐색 시간'],
  ['02', '반복되는 수동 컷', '장면을 찾은 뒤에도 시작과 끝을 직접 맞춰야 합니다. \n 몇 초 차이의 컷 조정이 반복되며 편집 흐름은 쉽게 끊깁니다.', '계속 반복되는 컷 조정'],
  ['03', '놓치는 좋은 순간', '계속 영상을 돌려보다 보면 정작 중요한 장면을 지나치기 쉽습니다. \n 좋은 컷을 고르는 일이 결국 집중력과 체력에 의존하게 됩니다.', '놓치기 쉬운 핵심 장면'],
];

export type FeatureVisualType = 'search' | 'candidates' | 'timeline' | 'chat';

export interface LandingFeature {
  id: 'f1' | 'f2' | 'f3' | 'f4';
  tab: string;
  no: string;
  title: ReactNode;
  body: string;
  bullets: string[];
  visual: FeatureVisualType;
  reverse?: boolean;
  tint?: boolean;
}

export const features: LandingFeature[] = [
  {
    id: 'f1',
    tab: '시나리오 검색',
    no: 'FEATURE 01',
    title: <>찾지 마세요.<br />문장으로 설명하세요</>,
    body: '원하는 장면을 자연어로 입력하면 AI가 영상 속 맥락을 이해해 관련 구간을 찾아냅니다. 단순 키워드가 아니라 행동, 상황, 흐름까지 함께 분석합니다.',
    bullets: [
      '화면, 음성, 맥락을 함께 분석',
      '한 영상에서 여러 장면을 동시에 검색',
    ],
    visual: 'search',
  },
  {
    id: 'f2',
    tab: '후보 추천',
    no: 'FEATURE 02',
    title: <>필요한 장면을<br />후보로 모아드립니다</>,
    body: '하나의 시나리오에 맞는 여러 후보 구간을 추천합니다. 시간대와 장면을 비교해보고, 가장 어울리는 컷만 선택하면 됩니다.',
    bullets: [
      '후보 구간과 시작, 종료 시간 제공',
      '클릭 한 번으로 미리보기와 선택',
    ],
    visual: 'candidates',
    reverse: true,
    tint: true,
  },
  {
    id: 'f3',
    tab: '타임라인 확인',
    no: 'FEATURE 03',
    title: <>영상 흐름 속 위치를<br />한눈에 확인하세요</>,
    body: '추천된 구간은 타임라인 위에 표시됩니다. 장면이 영상의 어느 흐름에 있는지 바로 확인하고, 필요한 구간만 빠르게 검토할 수 있습니다.',
    bullets: [
      '추천 구간을 타임라인 위에 표시',
      '웨이브폼과 함께 장면 위치 확인',
    ],
    visual: 'timeline',
  },
  {
    id: 'f4',
    tab: '대화형 편집',
    no: 'FEATURE 04',
    title: <>컷을 골랐다면,<br />편집은 대화로 이어가세요</>,
    body: '"이 구간은 2배속으로", "자막을 추가해줘"' + ' 처럼 자연어로 요청하면 AI가 선택한 컷에 바로 반영합니다. 복잡한 도구 조작 없이 대화하듯 완성하세요.',
    bullets: [
      '속도, 자막, 전환을 자연어로 요청',
      '선택한 구간에 편집 결과 자동 반영',
    ],
    visual: 'chat',
    reverse: true,
    tint: true,
  }
];

export const useCases = [
  {
    icon: icons.play,
    title: '크리에이터',
    body: '브이로그, 라이브에서 숏폼용 하이라이트를 빠르게 찾습니다. 콘텐츠 업로드 흐름을 더 빠르게 이어갈 수 있습니다.',
  },
  {
    icon: icons.cut,
    title: '영상 편집자',
    body: '클라이언트 원본 영상에서 필요한 컷을 후보로 받아봅니다. 반복 탐색을 줄이고 컷 선택과 편집에 더 집중할 수 있습니다.',
  },
  {
    icon: icons.grid,
    title: '마케터 및 브랜드 운영자',
    body: '제품 소개, 행사, 인터뷰 영상에서 핵심 장면을 추려냅니다. 홍보용 숏폼과 캠페인 콘텐츠 제작 시간을 줄일 수 있습니다.',
  },
  {
    icon: icons.file,
    title: '발표 및 프로젝트',
    body: '강연, 세미나, 프로젝트 영상에서 핵심 장면만 추려냅니다. 발표 자료와 요약 클립 제작에 바로 활용할 수 있습니다.',
  },
];
