interface PasswordStrength {
  color?: string;
  label: string;
  score: number;
}

function strengthOf(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return [
    { score: 0, label: '' },
    { score: 1, label: '약함', color: '#dc2626' },
    { score: 2, label: '보통', color: '#f59e0b' },
    { score: 3, label: '안전', color: '#10b981' },
    { score: 4, label: '매우 안전', color: '#067f5b' },
  ][Math.min(score, 4)];
}

export default function StrengthMeter({ password }: { password: string }) {
  const strength = strengthOf(password);
  if (!password) return null;

  return (
    <div className="flex items-center gap-2 pl-0.5">
      <div className="flex flex-1 gap-[3px]">
        {[1, 2, 3, 4].map((index) => (
          <div
            className="h-1 flex-1 rounded-sm transition-colors"
            key={index}
            style={{ background: index <= strength.score ? strength.color : 'rgba(0,0,0,0.08)' }}
          />
        ))}
      </div>
      <span className="min-w-[50px] text-right font-mono text-[11px]" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}
