/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYZE_API_URL?: string;
  readonly VITE_LOCAL_VIDEO_BASE_PATH?: string;
}

declare module '*.mov' {
  const src: string;
  export default src;
}
