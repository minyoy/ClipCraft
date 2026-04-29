import { useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import Icon from '../Icon';
import MonoLabel from '../MonoLabel';
import { icons } from '../icons';
import { fadeInUp, fadeSwap, videoPreviewEntrance } from '../../lib/animations';
import { cn } from '../../lib/cn';
import type { UploadedVideo, UploadStatus } from '../../types/pages/UploadScreen';

interface VideoUploadPanelProps {
  accent: string;
  panelPadding: string;
  accentTint: string;
  fileInputId: string;
  hasUploadedVideo: boolean;
  uploadedVideo: UploadedVideo | null;
  uploadStatus: UploadStatus;
  uploadError: string | null;
  uploadPct: number;
  selectedFile: File | null;
  useEmptyStateDesign: boolean;
  onFileSelect: (file: File) => void;
}

function DragDots() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      {[2, 6, 10].flatMap((x) =>
        [3, 7, 11].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill="#000" />
        )),
      )}
    </svg>
  );
}

function UploadCloudIcon({ active, accent }: { active: boolean; accent: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? accent : 'rgba(0,0,0,0.3)'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

export default function VideoUploadPanel({
  accent,
  panelPadding,
  accentTint,
  fileInputId,
  hasUploadedVideo,
  uploadedVideo,
  uploadStatus,
  uploadError,
  uploadPct,
  selectedFile,
  useEmptyStateDesign,
  onFileSelect,
}: VideoUploadPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const uploadShakeControls = useAnimationControls();
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);

  useEffect(() => {
    if (uploadError && !shouldReduceMotion) {
      void uploadShakeControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.36, ease: 'easeInOut' },
      });
    }
  }, [uploadError, shouldReduceMotion, uploadShakeControls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) onFileSelect(file);
  };

  const handleUploadDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsUploadDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <motion.section
      className={cn('flex h-[424px] flex-col bg-white max-[900px]:h-[424px]', useEmptyStateDesign ? 'rounded-[14px]' : 'rounded-xl', panelPadding)}
      style={{
        border: useEmptyStateDesign ? `1px dashed ${isUploadDragActive ? accent : 'rgba(0,0,0,0.14)'}` : '1px solid rgba(0,0,0,0.1)',
        background: useEmptyStateDesign && isUploadDragActive ? accentTint : '#fff',
        transition: 'background-color 0.18s ease, border-color 0.18s ease',
      }}
      variants={fadeInUp}
    >
      <div className={cn('flex items-center gap-2', useEmptyStateDesign ? 'mb-6' : 'mb-5')}>
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: useEmptyStateDesign ? 'rgba(0,0,0,0.18)' : accent }} />
        <MonoLabel>01 - 원본 영상 업로드</MonoLabel>
      </div>

      <input id={fileInputId} className="sr-only" type="file" accept="video/*" onChange={handleFileChange} aria-describedby={`${fileInputId}-hint`} />

      <motion.div className="mb-5 min-h-0 flex-1" animate={uploadShakeControls}>
        <AnimatePresence mode="wait" initial={false}>
          {hasUploadedVideo && uploadedVideo ? (
            <motion.div
              key="uploaded"
              className="relative h-full overflow-hidden rounded-lg bg-[#111]"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={shouldReduceMotion ? fadeSwap : videoPreviewEntrance}
            >
              <video className="h-full w-full object-contain" src={uploadedVideo.objectUrl} controls playsInline preload="metadata" />
            </motion.div>
          ) : (
            <motion.label
              key="empty"
              className={cn(
                'relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden transition-[border-color,box-shadow,background]',
                useEmptyStateDesign
                  ? 'rounded-[10px] border bg-[rgba(0,0,0,0.025)] px-6 py-12'
                  : 'rounded-lg border border-dashed bg-[#111]',
                useEmptyStateDesign
                  ? isUploadDragActive
                    ? 'shadow-[0_4px_18px_rgba(0,0,0,0.04)]'
                    : ''
                  : isUploadDragActive
                    ? 'border-white/45 shadow-[0_0_0_3px_rgba(255,255,255,0.16)_inset]'
                    : 'border-white/10',
              )}
              style={
                useEmptyStateDesign
                  ? {
                      background: uploadStatus === 'loading' ? '#fff' : isUploadDragActive ? `${accent}0c` : 'rgba(0,0,0,0.025)',
                      borderColor: isUploadDragActive ? `${accent}44` : 'transparent',
                    }
                  : undefined
              }
              htmlFor={fileInputId}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsUploadDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsUploadDragActive(true);
              }}
              onDragLeave={() => setIsUploadDragActive(false)}
              onDrop={handleUploadDrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeSwap}
            >
              {uploadStatus === 'loading' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[18px] px-4">
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
                    style={{ background: `${accent}18`, border: `1.5px solid ${accent}33` }}
                  >
                    <Icon d={icons.download} size={22} stroke={accent} />
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[480] tracking-[-0.1px]">업로드 중...</span>
                      <span className="font-mono text-[12px]" style={{ color: accent }}>{uploadPct}%</span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-[rgba(0,0,0,0.07)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${uploadPct}%`, background: accent, transition: 'width 0.12s linear' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'absolute inset-0 flex flex-col items-center justify-center',
                    useEmptyStateDesign ? 'gap-4' : 'gap-2 bg-[repeating-linear-gradient(135deg,#1a0a00_0px,#1a0a00_6px,#2a1200_6px,#2a1200_12px)]',
                  )}
                >
                  {useEmptyStateDesign ? (
                    <>
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-[14px] transition-all"
                        style={{ background: isUploadDragActive ? `${accent}22` : 'rgba(0,0,0,0.05)' }}
                      >
                        <UploadCloudIcon active={isUploadDragActive} accent={accent} />
                      </div>
                      <div className="text-center">
                        <div
                          className="mb-1.5 text-[15px] font-medium tracking-[-0.2px] transition-colors"
                          style={{ color: isUploadDragActive ? accent : 'rgba(0,0,0,0.65)' }}
                        >
                          {isUploadDragActive ? '여기에 놓으세요' : '영상을 업로드하세요'}
                        </div>
                        <div
                          id={`${fileInputId}-hint`}
                          className="mb-3 text-[12.5px] leading-[1.5] tracking-[-0.1px] text-[rgba(0,0,0,0.34)]"
                        >
                          파일을 드래그하거나 클릭하여 선택할 수 있습니다
                        </div>
                        {!isUploadDragActive && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.14)] bg-white px-[18px] py-2 text-[13px] font-[480] text-[rgba(0,0,0,0.65)]">
                            <Icon d={icons.folder} size={13} stroke="rgba(0,0,0,0.5)" />
                            파일 선택
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['MP4', 'MOV', 'AVI', 'MKV'].map((format) => (
                          <span
                            key={format}
                            className="rounded border border-[rgba(0,0,0,0.07)] bg-[rgba(0,0,0,0.04)] px-[7px] py-0.5 font-mono text-[10.5px] text-[rgba(0,0,0,0.28)]"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] tracking-[1px] text-white/35 uppercase">video upload</span>
                      <span className="text-[15px] font-[540] tracking-[-0.2px] text-white/80">영상을 업로드하세요</span>
                      <span id={`${fileInputId}-hint`} className="text-[11px] tracking-[-0.1px] text-white/35">
                        파일을 드래그하거나 클릭하여 선택할 수 있습니다
                      </span>
                    </>
                  )}
                </div>
              )}
            </motion.label>
          )}
        </AnimatePresence>
      </motion.div>

      {uploadError && <p className="-mt-3 mb-4 text-[12px] font-[480] tracking-[-0.1px] text-[#E0285A]">{uploadError}</p>}

      {!useEmptyStateDesign && (
        <label
          className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-[11px] transition-[border-color,background,box-shadow] hover:shadow-[0_3px_12px_rgba(0,0,0,0.04)]"
          htmlFor={fileInputId}
          style={{
            background: uploadedVideo ? accentTint : 'rgba(0,0,0,0.025)',
            border: uploadedVideo ? `1px solid ${accent}28` : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Icon d={icons.file} size={16} stroke={uploadedVideo ? accent : 'rgba(0,0,0,0.35)'} />
          <div className="flex-1">
            <div className="text-[13px] font-[480] tracking-[-0.1px]">
              {uploadedVideo ? uploadedVideo.fileName : selectedFile ? selectedFile.name : '선택된 파일 없음'}
            </div>
            <div className="mt-px font-mono text-[11px] text-[rgba(0,0,0,0.35)]">
              {uploadedVideo ? `${uploadedVideo.durationLabel} · ${uploadedVideo.sizeLabel}` : 'video/* 파일만 지원'}
            </div>
          </div>
          {uploadedVideo && (
            <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full" style={{ background: accent }}>
              <Icon d={icons.check} size={11} stroke="#fff" strokeWidth={2.5} />
            </div>
          )}
        </label>
      )}

      <div className={cn('border-t border-[rgba(0,0,0,0.07)] pt-3.5', useEmptyStateDesign ? 'mt-4 flex items-center justify-between' : 'flex gap-4')}>
        <span className="text-[11px] text-[rgba(0,0,0,0.3)]">{useEmptyStateDesign ? '최대 20GB' : 'MP4, MOV 지원 (최대 20GB)'}</span>
        <span className="text-[11px] text-[rgba(0,0,0,0.3)]">{useEmptyStateDesign ? 'MP4, MOV, AVI, MKV 지원' : '15분 이내 영상만 업로드 가능'}</span>
      </div>
    </motion.section>
  );
}
