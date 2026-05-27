import { useEffect } from 'react';
import Icon from '../Icon';
import { icons } from '../icons';
import type { ToastState } from '../../types/pages/ProjectsScreen';

interface ToastProps {
  onDismiss: () => void;
  toast: ToastState | null;
}

export default function Toast({ onDismiss, toast }: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onDismiss, toast.duration ?? 3000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-7 left-1/2 z-[2000] flex -translate-x-1/2 animate-[fadeIn_0.2s_ease] items-center gap-2.5 rounded-full bg-[#0a0a0a] px-[18px] py-3 text-[13.5px] font-[480] tracking-[-0.1px] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {toast.icon && <Icon d={icons[toast.icon]} size={14} stroke="#fff" strokeWidth={2} />}
      {toast.message}
      {toast.action && (
        <button className="ml-1 cursor-pointer border-0 bg-transparent p-0 text-[13px] font-[540] tracking-[-0.1px] text-[#a78bfa]" onClick={toast.action.onClick} type="button">
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
