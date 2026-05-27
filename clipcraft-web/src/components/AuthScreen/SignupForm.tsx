import { useState, type FormEvent } from 'react';
import { useTheme } from '../../App';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import PillButton from '../PillButton';
import { icons } from '../icons';
import AuthCheckbox from './AuthCheckbox';
import AuthField from './AuthField';
import SocialButton from './SocialButton';
import StrengthMeter from './StrengthMeter';

interface SignupFormProps {
  onSubmit: () => void;
  onSwitch: () => void;
}

interface SignupErrors {
  agree?: string | null;
  email?: string | null;
  name?: string | null;
  password?: string | null;
}

export default function SignupForm({ onSubmit, onSwitch }: SignupFormProps) {
  const { accent } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextErrors: SignupErrors = {};

    if (!name || name.trim().length < 2) nextErrors.name = '이름을 2자 이상 입력해주세요';
    if (!email) nextErrors.email = '이메일을 입력해주세요';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nextErrors.email = '올바른 이메일 형식이 아니에요';
    if (!password) nextErrors.password = '비밀번호를 입력해주세요';
    else if (password.length < 8) nextErrors.password = '비밀번호는 8자 이상이어야 해요';
    if (!agree) nextErrors.agree = '필수 약관에 동의해주세요';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 1000);
  };

  return (
    <form className="flex animate-[fadeIn_0.3s_ease] flex-col gap-4" onSubmit={submit}>
      <div>
        <MonoLabel className="mb-3 block">Create account · 시작하기</MonoLabel>
        <h2 className="mb-1.5 text-[32px] leading-[1.15] font-[620] tracking-[-0.9px]">
          AI 영상 편집을
          <br />
          더 빠르게 시작하세요
        </h2>
        <p className="text-sm leading-[1.55] tracking-[-0.15px] text-[rgba(0,0,0,0.5)]">
          원하는 장면을 말로 찾고, 편집 시간을 줄여보세요.
        </p>
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
        autoComplete="name"
        autoFocus
        error={errors.name}
        icon="user"
        label="이름"
        onChange={(value) => {
          setName(value);
          if (errors.name) setErrors((current) => ({ ...current, name: null }));
        }}
        placeholder="홍길동"
        value={name}
      />
      <AuthField
        autoComplete="email"
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
      <div className="flex flex-col gap-[7px]">
        <AuthField
          autoComplete="new-password"
          error={errors.password}
          hint={!errors.password && !password ? '영문 대/소문자, 숫자, 특수문자 조합을 권장해요' : null}
          icon="lock"
          label="비밀번호"
          onChange={(value) => {
            setPassword(value);
            if (errors.password) setErrors((current) => ({ ...current, password: null }));
          }}
          placeholder="8자 이상, 영문 + 숫자"
          type="password"
          value={password}
        />
        <StrengthMeter password={password} />
      </div>

      <div
        className="flex flex-col gap-2.5 rounded-xl px-4 py-3.5"
        style={{
          background: 'rgba(0,0,0,0.025)',
          border: errors.agree ? '1.5px solid #dc2626' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <AuthCheckbox
          checked={agree}
          label={
            <>
              <span className="font-[540]" style={{ color: accent }}>
                [필수]
              </span>{' '}
              이용약관 및 개인정보 처리방침에 동의합니다
            </>
          }
          onChange={(checked) => {
            setAgree(checked);
            if (errors.agree) setErrors((current) => ({ ...current, agree: null }));
          }}
          rightSlot={
            <button className="border-0 bg-transparent text-[11.5px] text-[rgba(0,0,0,0.4)] underline underline-offset-2" type="button">
              보기
            </button>
          }
        />
        <div className="h-px bg-[rgba(0,0,0,0.06)]" />
        <AuthCheckbox
          checked={agreeMarketing}
          label={
            <>
              <span className="font-[480] text-[rgba(0,0,0,0.4)]">[선택]</span> 마케팅 정보 수신 (이메일, 푸시)
            </>
          }
          onChange={setAgreeMarketing}
        />
      </div>
      {errors.agree && (
        <div className="-mt-2 flex items-center gap-1.5 pl-0.5 text-[11.5px] tracking-[-0.05px] text-[#dc2626]">
          <Icon d={icons.alert} size={11} stroke="#dc2626" strokeWidth={1.8} />
          {errors.agree}
        </div>
      )}

      <PillButton fullWidth iconRight="arrowR" loading={loading} type="submit" variant="accent">
        {loading ? '계정 만드는 중...' : '시작하기'}
      </PillButton>

      <p className="text-center text-[13.5px] tracking-[-0.1px] text-[rgba(0,0,0,0.5)]">
        이미 계정이 있으신가요?{' '}
        <button className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-[540] tracking-[-0.1px]" onClick={onSwitch} style={{ color: accent }} type="button">
          로그인 →
        </button>
      </p>
    </form>
  );
}
