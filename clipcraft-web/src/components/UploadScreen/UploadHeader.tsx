import { motion } from 'framer-motion';
import Logo from '../Logo';
import MonoLabel from '../MonoLabel';
import { containerStagger, fadeInUp } from '../../lib/animations';
import { cn } from '../../lib/cn';

interface UploadHeaderProps {
  useEmptyStateDesign: boolean;
}

export default function UploadHeader({ useEmptyStateDesign }: UploadHeaderProps) {
  return (
    <>
      <motion.div
        className={cn('flex w-full items-center will-change-[transform,opacity]', useEmptyStateDesign ? 'mb-10' : 'mb-8')}
        variants={fadeInUp}
      >
        <Logo height={40} />
      </motion.div>

      <motion.div className="text-center mb-10" variants={containerStagger}>
        <motion.div className="will-change-[transform,opacity]" variants={fadeInUp}>
          <MonoLabel className="block mb-4">AI Video Editor</MonoLabel>
        </motion.div>
        <motion.h1
          className="leading-[1.08] will-change-[transform,opacity] mb-[18px] text-[52px] font-semibold tracking-[-1.2px]"
          variants={fadeInUp}
        >
          영상 편집 시작하기
        </motion.h1>
        <motion.p
          className="font-[320] tracking-[-0.2px] will-change-[transform,opacity] text-[17px] leading-[1.55] text-[rgba(0,0,0,0.45)]"
          variants={fadeInUp}
        >
          원본 영상을 업로드하고, 편집할 장면 순서를 입력하면
          <br />
          AI가 하이라이트 편집을 자동으로 진행합니다.
        </motion.p>
      </motion.div>
    </>
  );
}
