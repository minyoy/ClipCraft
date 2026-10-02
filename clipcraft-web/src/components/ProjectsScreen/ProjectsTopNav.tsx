import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { icons } from '@/components/icons';
import { useAuth } from '@/lib/authContext';

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';

  const parts = trimmed.split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : trimmed.slice(0, 2).toUpperCase();
}

function UserMenu() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-xs font-semibold tracking-[-0.1px]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {getInitials(user.name)}
      </button>
      {open && (
        <div
          className="absolute top-[42px] right-0 z-[120] min-w-[200px] rounded-[12px] border border-black/[0.14] bg-white p-1.5 text-black shadow-[0_18px_44px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-white"
        >
          <div className="px-2.5 py-2">
            <div className="truncate text-[13px] font-[540] tracking-[-0.1px] text-black/85">{user.name}</div>
            <div className="truncate text-[11.5px] text-black/45">{user.email}</div>
          </div>
          <div className="mx-1 my-[5px] h-px bg-[rgba(0,0,0,0.07)]" />
          <button
            className="flex w-full items-center gap-2.5 rounded-lg border-0 px-2.5 py-2 text-left text-[13px] tracking-[-0.1px] text-[#dc2626] transition-colors hover:bg-[rgba(220,38,38,0.06)]"
            onClick={() => {
              setOpen(false);
              void logout().then(() => navigate('/auth'));
            }}
            type="button"
          >
            <Icon d={icons.logout} size={13} stroke="#dc2626" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsTopNav({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-[rgba(0,0,0,0.06)] bg-[rgba(250,250,250,0.85)] px-10 py-3.5 backdrop-blur-xl max-[760px]:px-5">
      <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onLogoClick} type="button" aria-label="랜딩 화면으로 이동">
        <Logo height={28} />
      </button>
      <div className="flex-1" />
      <UserMenu />
    </header>
  );
}
