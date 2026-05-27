import { useState, type FormEvent } from 'react';
import { useTheme } from '../../App';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import PillButton from '../PillButton';
import { icons } from '../icons';
import AuthField from './AuthField';
import SocialButton from './SocialButton';

interface LoginFormProps {
  onSubmit: () => void;
  onSwitch: () => void;
}

interface LoginErrors {
  email?: string | null;
  password?: string | null;
}

export default function LoginForm({ onSubmit, onSwitch }: LoginFormProps) {
  const { accent } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextErrors: LoginErrors = {};

    if (!email) nextErrors.email = '이메일을 입력해주세요';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nextErrors.email = '올바른 이메일 형식이 아니에요';
    if (!password) nextErrors.password = '비밀번호를 입력해주세요';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 900);
  };

  return (
    <form className="flex animate-[fadeIn_0.3s_ease] flex-col gap-[18px]" onSubmit={submit}>
      <div>
        <MonoLabel className="mb-3 block">Sign in</MonoLabel>
        <h2 className="mb-1.5 text-[32px] leading-[1.15] font-[620] tracking-[-0.9px]">다시 만나서 반가워요</h2>
        <p className="text-sm leading-[1.55] tracking-[-0.15px] text-[rgba(0,0,0,0.5)]">작업 중이던 프로젝트를 이어서 진행해보세요.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SocialButton kind="google" />
        <SocialButton kind="kakao" />
        <SocialButton kind="apple" />
      </div>

      <div className="my-0.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />
        <MonoLabel className="text-[10px]">또는 이메일로</MonoLabel>
        <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />
      </div>

      <AuthField
        autoComplete="email"
        autoFocus
        error={errors.email}
        icon="mail"
        label="이메일"
        onChange={(value) => {
          setEmail(value);
          if (errors.email) setErrors((current) => ({ ...current, email: null }));
        }}
        placeholder="you@example.com"
        type="email"
        value={email}
      />
      <AuthField
        autoComplete="current-password"
        error={errors.password}
        icon="lock"
        label="비밀번호"
        onChange={(value) => {
          setPassword(value);
          if (errors.password) setErrors((current) => ({ ...current, password: null }));
        }}
        placeholder="••••••••"
        type="password"
        value={password}
      />

      <div className="-mt-1 flex items-center justify-between gap-4">
        <label className="flex cursor-pointer select-none items-center gap-2">
          <span
            className="flex h-4 w-4 items-center justify-center rounded-[5px] transition-all"
            style={{
              background: remember ? accent : '#fff',
              border: `1.5px solid ${remember ? accent : 'rgba(0,0,0,0.2)'}`,
            }}
          >
            {remember && <Icon d={icons.check} size={10} stroke="#fff" strokeWidth={2.5} />}
          </span>
          <input checked={remember} className="pointer-events-none absolute opacity-0" onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
          <span className="text-[13px] tracking-[-0.1px] text-[rgba(0,0,0,0.65)]">로그인 상태 유지</span>
        </label>
        <button className="border-0 bg-transparent text-[13px] font-medium tracking-[-0.1px]" style={{ color: accent }} type="button">
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <PillButton fullWidth iconRight="arrowR" loading={loading} type="submit" variant="accent">
        {loading ? '로그인 중...' : '로그인'}
      </PillButton>

      <p className="mt-0.5 text-center text-[13.5px] tracking-[-0.1px] text-[rgba(0,0,0,0.5)]">
        아직 계정이 없으신가요?{' '}
        <button className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-[540] tracking-[-0.1px]" onClick={onSwitch} style={{ color: accent }} type="button">
          회원가입 →
        </button>
      </p>
    </form>
  );
}
