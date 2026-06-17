import { useState } from 'react';
import Icon from '@/components/Icon';
import MonoLabel from '@/components/MonoLabel';
import { icons, type IconName } from '@/components/icons';
import { useTheme } from '@/App';

interface AuthFieldProps {
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | null;
  hint?: string | null;
  icon?: IconName;
  label: string;
  onBlur?: () => void;
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
  onBlur,
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
    <div className="flex flex-col gap-2">
      <MonoLabel className="text-black/42">{label}</MonoLabel>
      <div
        className="flex min-h-[48px] items-center gap-2.5 rounded-[14px] bg-white px-4 transition-[border-color,box-shadow,background-color]"
        style={{
          border: `1px solid ${error ? '#dc2626' : focused ? accent : 'rgba(0,0,0,0.105)'}`,
          boxShadow: focused && !error ? `0 0 0 4px ${accent}18` : error ? '0 0 0 4px rgba(220,38,38,0.09)' : '0 1px 0 rgba(0,0,0,0.02)',
        }}
      >
        {icon && <Icon d={icons[icon]} size={15} stroke={focused ? accent : 'rgba(0,0,0,0.34)'} strokeWidth={1.6} />}
        <input
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="h-[46px] min-w-0 flex-1 border-0 bg-transparent text-[14.5px] tracking-[-0.12px] text-black outline-none placeholder:text-black/28"
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          type={inputType}
          value={value}
        />
        {type === 'password' && value && (
          <button className="flex cursor-pointer border-0 bg-transparent p-1" onClick={() => setShowPassword((current) => !current)} type="button">
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
