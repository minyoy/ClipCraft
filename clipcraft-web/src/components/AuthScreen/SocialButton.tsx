import { useState } from 'react';

type SocialKind = 'apple' | 'google' | 'kakao';
const LOGO_SIZE = 17;

interface SocialButtonProps {
  kind: SocialKind;
}

const socialConfig = {
  google: {
    label: 'Google로 계속하기',
  },
  kakao: {
    label: 'Kakao로 계속하기',
    path: 'M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1 3.6c-.1.3.2.6.5.4l4.3-2.8c.5 0 1 .1 1.5.1 5.5 0 10-3.5 10-7.9S17.5 3 12 3z',
  },
  apple: {
    label: 'Apple로 계속하기',
    path: 'M17.5 12.5c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.1.7 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.5-3.9zM15.1 5.4c.7-.8 1.1-1.9 1-3-.9.1-2.1.7-2.7 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.7-1.4z',
  },
};

function SocialLogo({ kind }: SocialButtonProps) {
  if (kind === 'google') {
    return (
      <svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
        <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.12-1.43.34-2.1V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
    );
  }

  if (kind === 'kakao') {
    return (
      <svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 24 24" fill="#191600" aria-hidden="true">
        <path d={socialConfig.kakao.path} />
      </svg>
    );
  }

  return (
    <svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="3 2 18 20" fill="#000" aria-hidden="true">
      <path d={socialConfig.apple.path} />
    </svg>
  );
}

export default function SocialButton({ kind }: SocialButtonProps) {
  const [hovered, setHovered] = useState(false);
  const config = socialConfig[kind];

  return (
    <button
      aria-label={config.label}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-[rgba(0,0,0,0.12)] px-4 py-[11px] text-[13.5px] font-[540] tracking-[-0.15px] text-black outline-none transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#f6f6f6' : '#fff' }}
      type="button"
    >
      <span className="flex h-[17px] w-[17px] items-center justify-center">
        <SocialLogo kind={kind} />
      </span>
      {config.label}
    </button>
  );
}
