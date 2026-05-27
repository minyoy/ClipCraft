import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '../../App';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import PillButton from '../PillButton';
import { icons } from '../icons';

interface NewProjectPayload {
  format: string;
  name: string;
}

interface NewProjectModalProps {
  onCancel: () => void;
  onCreate: (project: NewProjectPayload) => void;
}

const formats = [
  { v: '16:9', label: '가로 (16:9)', sub: 'YouTube · TV' },
  { v: '9:16', label: '세로 (9:16)', sub: 'Shorts · Reels' },
  { v: '1:1', label: '정사각 (1:1)', sub: 'Instagram' },
];

export default function NewProjectModal({ onCancel, onCreate }: NewProjectModalProps) {
  const { accent } = useTheme();
  const [name, setName] = useState('');
  const [format, setFormat] = useState('16:9');
  const inputRef = useRef<HTMLInputElement>(null);
  const canCreate = name.trim().length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex animate-[overlayIn_0.18s_ease] items-center justify-center bg-[rgba(0,0,0,0.32)] p-6 backdrop-blur" onClick={onCancel}>
      <div className="w-full max-w-[480px] animate-[modalIn_0.2s_cubic-bezier(0.16,1,0.3,1)] rounded-2xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-[18px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: `${accent}18` }}>
              <Icon d={icons.sparkles} size={18} stroke={accent} />
            </div>
            <MonoLabel>New Project</MonoLabel>
          </div>
          <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-[rgba(0,0,0,0.05)]" onClick={onCancel} type="button">
            <Icon d={icons.close} size={14} stroke="rgba(0,0,0,0.5)" />
          </button>
        </div>

        <h3 className="mb-1.5 text-[22px] font-[620] tracking-[-0.5px]">새 프로젝트 만들기</h3>
        <p className="mb-[22px] text-[13.5px] leading-[1.55] tracking-[-0.1px] text-[rgba(0,0,0,0.45)]">이름과 영상 비율을 정해주세요. 생성 후 영상을 업로드하고 시나리오를 입력하면 편집이 시작됩니다.</p>

        <div className="mb-[18px]">
          <MonoLabel className="mb-2 block">프로젝트 이름</MonoLabel>
          <input
            className="w-full rounded-[10px] border-[1.5px] border-[rgba(0,0,0,0.12)] px-3.5 py-3 text-sm tracking-[-0.1px] outline-none transition-colors focus:border-[var(--project-accent)]"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canCreate) onCreate({ name: name.trim(), format });
            }}
            placeholder="예: 김치찌개 만들기 쿠킹 영상"
            ref={inputRef}
            style={{ '--project-accent': accent } as CSSProperties}
            value={name}
          />
        </div>

        <div className="mb-6">
          <MonoLabel className="mb-2 block">영상 비율</MonoLabel>
          <div className="flex gap-2 max-[520px]:flex-col">
            {formats.map((item) => {
              const active = format === item.v;
              return (
                <button
                  className="flex-1 cursor-pointer rounded-[10px] border-[1.5px] px-2.5 py-3 text-center transition-all"
                  key={item.v}
                  onClick={() => setFormat(item.v)}
                  style={{
                    background: active ? `${accent}0e` : '#fff',
                    borderColor: active ? accent : 'rgba(0,0,0,0.1)',
                  }}
                  type="button"
                >
                  <div className="mb-1.5 flex justify-center">
                    <div
                      className="rounded-[3px] border-[1.5px]"
                      style={{
                        width: item.v === '16:9' ? 28 : item.v === '9:16' ? 14 : 20,
                        height: item.v === '16:9' ? 16 : item.v === '9:16' ? 24 : 20,
                        borderColor: active ? accent : 'rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                  <div className="text-[12.5px] font-[540] tracking-[-0.1px]" style={{ color: active ? accent : 'rgba(0,0,0,0.75)' }}>
                    {item.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-[rgba(0,0,0,0.4)]">{item.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <PillButton onClick={onCancel} small variant="glass">
            취소
          </PillButton>
          <PillButton disabled={!canCreate} icon="plus" onClick={() => onCreate({ name: name.trim(), format })} small variant="accent">
            프로젝트 생성
          </PillButton>
        </div>
      </div>
    </div>
  );
}
