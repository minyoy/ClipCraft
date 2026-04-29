export const icons = {
  cut: 'M6 3a3 3 0 110 6 3 3 0 010-6zm12 0a3 3 0 110 6 3 3 0 010-6zM8.5 8.5l7 7M18 15a3 3 0 110 6 3 3 0 010-6zM6 15a3 3 0 110 6 3 3 0 010-6zm2.5-1.5l7-7',
  audio: 'M2 12h2M6 8v8M10 5v14M14 8v8M18 10v4M22 12h2',
  fx: 'M5 12h14M12 5l7 7-7 7',
  text: 'M17 10H3M21 6H3M21 14H3M17 18H3',
  filter: 'M3 6h18M7 12h10M11 18h2',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  play: 'M5 3l14 9-14 9V3z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  skip: 'M19 5v14M5 5l10 7-10 7V5z',
  vol: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
  volOff: 'M11 5L6 9H2v6h4l5 4V5zM16 9l6 6M22 9l-6 6',
  send: 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z',
  history: 'M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2',
  bot: 'M12 2a4 4 0 014 4v1h1a3 3 0 013 3v7a3 3 0 01-3 3H7a3 3 0 01-3-3V10a3 3 0 013-3h1V6a4 4 0 014-4zm0 2a2 2 0 00-2 2v1h4V6a2 2 0 00-2-2zm-4 7a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  check: 'M20 6L9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  wand: 'M15 4V2M15 16v-2M8 9H6M20 9h-2M17.8 11.8L19.2 13.2M17.8 6.2L19.2 4.8M10.2 6.2L8.8 4.8M10.2 11.8L8.8 13.2M15 9a3 3 0 11-6 0 3 3 0 016 0z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  download: 'M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M12 3v12M7 10l5 5 5-5',
} as const;

export type IconName = keyof typeof icons;
