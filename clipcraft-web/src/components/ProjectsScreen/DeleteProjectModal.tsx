import { useState } from 'react';
import Icon from '../Icon';
import PillButton from '../PillButton';
import { icons } from '../icons';
import type { ProjectItem } from '../../types/pages/ProjectsScreen';

interface DeleteProjectModalProps {
  onCancel: () => void;
  onConfirm: (project: ProjectItem) => void;
  project: ProjectItem;
}

export default function DeleteProjectModal({ onCancel, onConfirm, project }: DeleteProjectModalProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] flex animate-[overlayIn_0.18s_ease] items-center justify-center bg-[rgba(0,0,0,0.32)] p-6 backdrop-blur" onClick={onCancel}>
      <div className="w-full max-w-[420px] animate-[modalIn_0.2s_cubic-bezier(0.16,1,0.3,1)] rounded-2xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-[18px] flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(239,68,68,0.1)]">
          <Icon d={icons.trash} size={22} stroke="#dc2626" />
        </div>
        <h3 className="mb-2 text-xl font-[620] tracking-[-0.4px]">프로젝트를 삭제할까요?</h3>
        <p className="mb-1.5 text-[13.5px] leading-[1.6] tracking-[-0.1px] text-[rgba(0,0,0,0.55)]">
          <span className="font-[540] text-black">"{project.title}"</span> 프로젝트의 원본 영상, 편집 결과물, 시나리오, 채팅 히스토리가 모두 영구적으로 삭제됩니다.
        </p>
        <p className="mb-[22px] text-xs tracking-[-0.1px] text-[rgba(220,38,38,0.85)]">이 작업은 되돌릴 수 없습니다.</p>
        <div className="flex justify-end gap-2">
          <PillButton onClick={onCancel} small variant="glass">
            취소
          </PillButton>
          <PillButton
            disabled={confirming}
            icon="trash"
            onClick={() => {
              setConfirming(true);
              window.setTimeout(() => onConfirm(project), 200);
            }}
            small
            variant="danger"
          >
            {confirming ? '삭제하는 중...' : '삭제'}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
