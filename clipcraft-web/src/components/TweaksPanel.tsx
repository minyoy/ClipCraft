import { cn } from '../lib/cn';
import type { Density, ThemeTweaks } from '../types/app';
import type { TweaksPanelProps } from '../types/components/TweaksPanel';

const ACCENTS = [
  { name: 'Indigo', hex: '#5B4CF5' },
  { name: 'Coral', hex: '#E8522E' },
  { name: 'Teal', hex: '#0BA896' },
  { name: 'Violet', hex: '#8B3CF7' },
  { name: 'Amber', hex: '#D4820A' },
  { name: 'Rose', hex: '#E0285A' },
  { name: 'Slate', hex: '#334155' },
  { name: 'Forest', hex: '#1A7A4A' },
];

export default function TweaksPanel({ tweaks, setTweaks, onClose }: TweaksPanelProps) {
  const save = (patch: Partial<ThemeTweaks>) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  return (
    <div className="fixed right-6 bottom-6 z-[9999] w-64 animate-[panelIn_0.2s_ease] overflow-hidden rounded-[14px] border border-[rgba(0,0,0,0.12)] bg-white font-sans shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.07)] px-4 pt-3.5 pb-3">
        <span className="font-mono text-xs font-[540] uppercase tracking-[0.5px] text-[rgba(0,0,0,0.4)]">Tweaks</span>
        <button
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-0 bg-[rgba(0,0,0,0.06)] text-[13px] text-black/50"
          onClick={() => {
            onClose();
            window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
          }}
          type="button"
        >
          x
        </button>
      </div>

      <div className="px-4 py-3.5">
        <span className="mb-2.5 block text-[11px] font-[480] tracking-[-0.05px] text-[rgba(0,0,0,0.4)]">포인트 컬러</span>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((color) => (
            <button
              key={color.hex}
              className={cn(
                'h-7 w-7 cursor-pointer rounded-full border-2 border-transparent transition hover:scale-110',
                tweaks.accent === color.hex && 'border-black shadow-[0_0_0_2px_#fff_inset]',
              )}
              onClick={() => save({ accent: color.hex })}
              style={{ background: color.hex }}
              title={color.name}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(0,0,0,0.06)] px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="block text-[11px] font-[480] tracking-[-0.05px] text-[rgba(0,0,0,0.4)]">다크 사이드바</span>
          <button
            className={cn(
              'relative h-5 w-9 cursor-pointer rounded-full border-0 transition-colors',
              tweaks.darkSidebar ? 'bg-black' : 'bg-[rgba(0,0,0,0.12)]',
            )}
            onClick={() => save({ darkSidebar: !tweaks.darkSidebar })}
            type="button"
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-[left]',
                tweaks.darkSidebar ? 'left-[18px]' : 'left-0.5',
              )}
              style={{ background: tweaks.darkSidebar ? tweaks.accent : '#fff' }}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-[rgba(0,0,0,0.06)] px-4 py-3.5">
        <span className="mb-2.5 block text-[11px] font-[480] tracking-[-0.05px] text-[rgba(0,0,0,0.4)]">레이아웃 밀도</span>
        <div className="flex gap-1.5">
          {(['compact', 'comfortable', 'spacious'] as Density[]).map((density) => (
            <button
              key={density}
              className={cn(
                'flex-1 cursor-pointer rounded-lg border border-[rgba(0,0,0,0.1)] bg-transparent py-[7px] text-xs font-[480] tracking-[-0.05px] text-black/50 transition',
                tweaks.density === density && 'text-white',
              )}
              onClick={() => save({ density })}
              style={
                tweaks.density === density
                  ? { background: tweaks.accent, borderColor: tweaks.accent }
                  : {}
              }
              type="button"
            >
              {density === 'compact' ? '좁게' : density === 'comfortable' ? '기본' : '넓게'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
