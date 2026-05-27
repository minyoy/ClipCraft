import { useState } from 'react';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import { icons, type IconName } from '../icons';
import { useTheme } from '../../App';

interface AuthFieldProps {
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | null;
  hint?: string | null;
  icon?: IconName;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'email' | 'password' | 'text';
  value: string;
}

export default function AuthField({
  autoComplete,
  autoFocus,
  error,
  hint,
  icon,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: AuthFieldProps) {
  const { accent } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-[7px]">
      <MonoLabel>{label}</MonoLabel>
      <div
        className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-[11px] transition-[border-color,box-shadow]"
        style={{
          border: `1.5px solid ${error ? '#dc2626' : focused ? accent : 'rgba(0,0,0,0.12)'}`,
          boxShadow: focused && !error ? `0 0 0 4px ${accent}14` : error ? '0 0 0 4px rgba(220,38,38,0.10)' : 'none',
        }}
      >
        {icon && <Icon d={icons[icon]} size={15} stroke={focused ? accent : 'rgba(0,0,0,0.4)'} strokeWidth={1.6} />}
        <input
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] tracking-[-0.15px] text-black outline-none placeholder:text-[rgba(0,0,0,0.3)]"
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          type={inputType}
          value={value}
        />
        {type === 'password' && value && (
          <button className="flex cursor-pointer border-0 bg-transparent p-0.5" onClick={() => setShowPassword((current) => !current)} type="button">
            <Icon d={showPassword ? icons.eyeOff : icons.eye} size={15} stroke="rgba(0,0,0,0.4)" />
          </button>
        )}
      </div>
      {(error || hint) && (
        <div className="flex items-center gap-1.5 pl-0.5 text-[11.5px] tracking-[-0.05px]" style={{ color: error ? '#dc2626' : 'rgba(0,0,0,0.45)' }}>
          {error && <Icon d={icons.alert} size={11} stroke="#dc2626" strokeWidth={1.8} />}
          {error || hint}
        </div>
      )}
    </div>
  );
}
