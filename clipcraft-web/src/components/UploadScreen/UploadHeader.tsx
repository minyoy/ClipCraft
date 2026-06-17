import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import MonoLabel from '@/components/MonoLabel';
import { containerStagger, fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/cn';

interface UploadHeaderProps {
  onLogoClick: () => void;
  projectFormat?: string;
  projectName: string;
  useEmptyStateDesign: boolean;
}

const formatLabels: Record<string, string> = {
  '16:9': '가로 16:9',
  '9:16': '세로 9:16',
  '1:1': '정사각형 1:1',
};

export default function UploadHeader({ onLogoClick, projectFormat, projectName, useEmptyStateDesign }: UploadHeaderProps) {
  const projectFormatLabel = projectFormat ? (formatLabels[projectFormat] ?? projectFormat) : null;

  return (
    <>
      <motion.div
        className={cn('flex w-full items-center will-change-[transform,opacity]', useEmptyStateDesign ? 'mb-10' : 'mb-8')}
        variants={fadeInUp}
      >
        <button className="cursor-pointer border-0 bg-transparent p-0" onClick={onLogoClick} type="button" aria-label="랜딩 화면으로 이동">
          <Logo height={40} />
        </button>
      </motion.div>

      <motion.div className="text-center mb-10" variants={containerStagger}>
        <motion.div className="mb-4 flex items-center justify-center gap-2.5 will-change-[transform,opacity]" variants={fadeInUp}>
          <MonoLabel>AI Video Editor</MonoLabel>
          {projectFormatLabel && (
            <span className="inline-flex rounded-full border border-black/[0.08] bg-black/[0.035] px-2.5 py-0.5 font-mono text-[10.5px] tracking-[0.2px] text-black/42">
              {projectFormatLabel}
            </span>
          )}
        </motion.div>
        <motion.h1
          className="leading-[1.08] will-change-[transform,opacity] mb-[18px] text-[52px] font-semibold tracking-[-1.2px] max-[760px]:text-[40px]"
          variants={fadeInUp}
        >
          {projectName}
        </motion.h1>
        <motion.p
          className="font-[320] tracking-[-0.2px] will-change-[transform,opacity] text-[17px] leading-[1.55] text-[rgba(0,0,0,0.45)]"
          variants={fadeInUp}
        >
          원본 영상을 업로드하고,
          <br />
          찾고 싶은 장면을 순서대로 입력하세요.
        </motion.p>
      </motion.div>
    </>
  );
}
