import { useState, type FormEvent } from 'react';
import { useTheme } from '@/App';
import Icon from '@/components/Icon';
import MonoLabel from '@/components/MonoLabel';
import PillButton from '@/components/PillButton';
import { icons } from '@/components/icons';
import AuthField from '@/components/AuthScreen/AuthField';

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
  const validateEmailFormat = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextErrors: LoginErrors = {};

    if (!email) nextErrors.email = '이메일을 입력해주세요';
    else if (!validateEmailFormat(email)) nextErrors.email = '올바른 이메일 형식이 아니에요';
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
    <form className="flex animate-[fadeIn_0.3s_ease] flex-col gap-7" onSubmit={submit}>
      <div>
        <MonoLabel className="mb-4 block text-black/35">SIGN IN</MonoLabel>
        <h2 className="mb-3 whitespace-pre-line text-[31px] leading-[1.16] font-[620] tracking-[-0.8px] text-black max-[520px]:text-[28px]">
          {'작업 중인 영상을\n계속 이어가세요'}
        </h2>
        <p className="whitespace-pre-line text-[14.5px] leading-[1.62] tracking-[-0.12px] text-black/52">
          {'이메일로 로그인하고\n저장된 프로젝트와 추천 구간을 다시 확인하세요.'}
        </p>
      </div>

      <div className="flex flex-col gap-[18px]">
        <AuthField
          autoComplete="email"
          autoFocus
          error={errors.email}
          icon="mail"
          label="이메일"
          onBlur={() => {
            if (email && !validateEmailFormat(email)) {
              setErrors((current) => ({ ...current, email: '올바른 이메일 형식이 아니에요' }));
            }
          }}
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
          placeholder="비밀번호를 입력하세요"
          type="password"
          value={password}
        />
      </div>

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
          <span className="text-[13px] tracking-[-0.1px] text-black/60">로그인 상태 유지</span>
        </label>
        <button className="border-0 bg-transparent text-[13px] font-medium tracking-[-0.1px] text-black/55 transition hover:text-black" type="button">
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <PillButton fullWidth loading={loading} type="submit" variant="black" className="mt-1 py-[13px] text-[14.5px] font-[520]">
        {loading ? '로그인 중...' : '로그인'}
      </PillButton>

      <p className="pt-0.5 text-center text-[13.5px] tracking-[-0.1px] text-black/48">
        아직 계정이 없나요?{' '}
        <button className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-[540] tracking-[-0.1px] transition hover:opacity-75" onClick={onSwitch} style={{ color: accent }} type="button">
          무료로 시작하기
        </button>
      </p>
    </form>
  );
}
