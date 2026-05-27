import type { ReactNode } from 'react';
import { useTheme } from '../../App';
import Icon from '../Icon';
import { icons } from '../icons';

interface AuthCheckboxProps {
  checked: boolean;
  label: ReactNode;
  onChange: (checked: boolean) => void;
  rightSlot?: ReactNode;
}

export default function AuthCheckbox({ checked, label, onChange, rightSlot }: AuthCheckboxProps) {
  const { accent } = useTheme();

  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5">
      <span
        className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] transition-all"
        style={{
          background: checked ? accent : '#fff',
          border: `1.5px solid ${checked ? accent : 'rgba(0,0,0,0.22)'}`,
        }}
      >
        {checked && <Icon d={icons.check} size={10} stroke="#fff" strokeWidth={2.6} />}
      </span>
      <input checked={checked} className="pointer-events-none absolute opacity-0" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span className="flex-1 text-[13px] leading-[1.4] tracking-[-0.1px] text-[rgba(0,0,0,0.7)]">{label}</span>
      {rightSlot}
    </label>
  );
}
