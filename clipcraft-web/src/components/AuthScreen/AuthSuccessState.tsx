import { useTheme } from '../../App';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import PillButton from '../PillButton';
import { icons } from '../icons';

interface AuthSuccessStateProps {
  mode: 'login' | 'signup';
  onContinue: () => void;
}

export default function AuthSuccessState({ mode, onContinue }: AuthSuccessStateProps) {
  const { accent } = useTheme();

  return (
    <div className="flex animate-[fadeIn_0.4s_ease] flex-col items-center gap-[18px] py-5 text-center">
      <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[20px]" style={{ background: `${accent}18` }}>
        <div className="absolute -inset-1.5 animate-[pulse_2s_ease-in-out_infinite] rounded-3xl border-2" style={{ borderColor: `${accent}33` }} />
        <Icon d={icons.check} size={32} stroke={accent} strokeWidth={2.2} />
      </div>
      <div>
        <MonoLabel className="mb-2.5 block">{mode === 'login' ? 'Signed in' : 'Account created'}</MonoLabel>
        <h2 className="mb-2 text-[26px] leading-[1.2] font-[620] tracking-[-0.6px]">{mode === 'login' ? '환영합니다' : '계정이 만들어졌어요'}</h2>
        <p className="max-w-80 text-sm leading-[1.55] tracking-[-0.15px] text-[rgba(0,0,0,0.5)]">
          {mode === 'login' ? '프로젝트 대시보드로 이동합니다.' : '이메일로 인증 링크를 보내드렸어요. 첫 프로젝트를 만들어볼까요?'}
        </p>
      </div>
      <PillButton iconRight="arrowR" onClick={onContinue} variant="accent">
        프로젝트 시작하기
      </PillButton>
    </div>
  );
}
