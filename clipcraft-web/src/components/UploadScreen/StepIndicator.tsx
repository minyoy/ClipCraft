import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import { cn } from '../../lib/cn';

const STEPS = [
  { step: '1', label: '영상 업로드', muted: false },
  { step: '2', label: '시나리오 입력', muted: false },
  { step: '3', label: '편집 시작', muted: true },
] as const;

export default function StepIndicator() {
  return (
    <motion.div className="mb-5 flex w-full items-center gap-3 will-change-[transform,opacity]" variants={fadeInUp}>
      {STEPS.map(({ step, label, muted }, index) => (
        <Fragment key={step}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px]',
                muted ? 'bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.2)]' : 'bg-[rgba(0,0,0,0.07)] text-[rgba(0,0,0,0.35)]',
              )}
            >
              {step}
            </div>
            <span className={cn('text-[12.5px] tracking-[-0.1px]', muted ? 'text-[rgba(0,0,0,0.25)]' : 'text-[rgba(0,0,0,0.4)]')}>
              {label}
            </span>
          </div>
          {index < 2 && <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />}
        </Fragment>
      ))}
    </motion.div>
  );
}
