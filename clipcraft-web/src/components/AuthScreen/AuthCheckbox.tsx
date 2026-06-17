import type { ReactNode } from 'react';
import { useTheme } from '@/App';
import Icon from '@/components/Icon';
import { icons } from '@/components/icons';

interface AuthCheckboxProps {
  checked: boolean;
  label: ReactNode;
  onChange: (checked: boolean) => void;
  rightSlot?: ReactNode;
}

export default function AuthCheckbox({ checked, label, onChange, rightSlot }: AuthCheckboxProps) {
  const { accent } = useTheme();

  return (
    <label className="flex cursor-pointer select-none items-start gap-2.5 rounded-[12px] py-0.5">
      <span
        className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] transition-all"
        style={{
          background: checked ? accent : '#fff',
          border: `1px solid ${checked ? accent : 'rgba(0,0,0,0.18)'}`,
          boxShadow: checked ? `0 0 0 3px ${accent}12` : '0 1px 0 rgba(0,0,0,0.02)',
        }}
      >
        {checked && <Icon d={icons.check} size={9.5} stroke="#fff" strokeWidth={2.6} />}
      </span>
      <input checked={checked} className="pointer-events-none absolute opacity-0" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span className="flex-1 text-[13px] leading-[1.45] tracking-[-0.08px] text-black/62">{label}</span>
      {rightSlot}
    </label>
  );
}
