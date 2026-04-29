import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useTheme } from '../App';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import MonoLabel from '../components/MonoLabel';
import PillButton from '../components/PillButton';
import { icons } from '../components/icons';
import { containerStagger, fadeInUp, fadeSwap, videoPreviewEntrance } from '../lib/animations';
import { cn } from '../lib/cn';
import { requestHighlightAnalysis } from '../api/highlight';
import {
  captureVideoThumbnail,
  formatDuration,
  formatFileSize,
  isVideoFile,
  loadVideoDuration,
  MAX_VIDEO_DURATION_SECONDS,
} from '../lib/videoUpload';
import type { ScenarioItem } from '../types/app';
import type { UploadedVideo, UploadScreenProps, UploadStatus } from '../types/pages/UploadScreen';

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
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? accent : 'rgba(0,0,0,0.3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

export default function UploadFlow({ onNext }: UploadScreenProps) {
  const { accent, density } = useTheme();
  const fileInputId = useId();
  const scenarioInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const uploadShakeControls = useAnimationControls();
  const panelPadding = density === 'compact' ? 'p-5' : density === 'spacious' ? 'p-9' : 'p-7';
  const accentTint = `${accent}18`;
  const [items, setItems] = useState<ScenarioItem[]>([]);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [hoverItem, setHoverItem] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [scenarioInputValue, setScenarioInputValue] = useState('');
  const [isScenarioInputFocused, setIsScenarioInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (uploadStatus !== 'loading') {
      setUploadPct(0);
      return;
    }
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 10 + (pct < 60 ? 5 : 1.5);
      if (pct >= 90) {
        clearInterval(iv);
        pct = 90;
      }
      setUploadPct(Math.round(Math.min(90, pct)));
    }, 120);
    return () => clearInterval(iv);
  }, [uploadStatus]);
  const hasUploadedVideo = uploadStatus === 'success' && uploadedVideo !== null;

  useLayoutEffect(() => {
    if (hasUploadedVideo) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [hasUploadedVideo]);
  const useEmptyStateDesign = !hasUploadedVideo;
  const canStartEditing = hasUploadedVideo && items.length > 0;

  const handleDrop = (targetId: number) => {
    if (!draggingItem || draggingItem === targetId) return;

    const from = items.findIndex((item) => item.id === draggingItem);
    const to = items.findIndex((item) => item.id === targetId);
    const next = [...items];
    const [moved] = next.splice(from, 1);

    next.splice(to, 0, moved);
    setItems(next);
    setDraggingItem(null);
    setHoverItem(null);
  };

  const addScenarioItem = (value = scenarioInputValue) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setItems((current) => [
      ...current,
      {
        id: current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        ko: trimmed,
        en: trimmed,
      },
    ]);
    setScenarioInputValue('');
    scenarioInputRef.current?.focus();
  };

  const removeScenarioItem = (itemId: number) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const startHighlightAnalysis = async () => {
    if (!uploadedVideo || !canStartEditing || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const analysis = await requestHighlightAnalysis(uploadedVideo.file, items);
      videoObjectUrlRef.current = null;
      onNext({
        ...analysis,
        videoUrl: uploadedVideo.objectUrl,
        videoName: uploadedVideo.fileName,
      });
    } catch {
      setSubmitError('분석 요청에 실패했습니다. API 주소와 서버 상태를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScenarioKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      addScenarioItem();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, itemId: number) => {
    event.preventDefault();
    if (itemId !== draggingItem) setHoverItem(itemId);
  };

  const triggerUploadError = (message: string) => {
    setUploadError(message);
    setUploadStatus('idle');
    setSelectedFile(null);
    setUploadedVideo(null);

    if (!shouldReduceMotion) {
      void uploadShakeControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.36, ease: 'easeInOut' },
      });
    }
  };

  const videoObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (videoObjectUrlRef.current) URL.revokeObjectURL(videoObjectUrlRef.current);
    };
  }, []);

  const processVideoFile = async (file: File) => {
    scrollPositionRef.current = window.scrollY;
    setUploadError(null);
    setUploadedVideo(null);
    setSelectedFile(file);

    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(videoObjectUrlRef.current);
      videoObjectUrlRef.current = null;
    }

    if (!isVideoFile(file)) {
      triggerUploadError('동영상 파일만 업로드할 수 있습니다');
      return;
    }

    setUploadStatus('loading');
    const objectUrl = URL.createObjectURL(file);

    try {
      const duration = await loadVideoDuration(objectUrl);

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        URL.revokeObjectURL(objectUrl);
        triggerUploadError('15분 이내의 동영상만 업로드할 수 있습니다');
        return;
      }

      const thumbnailUrl = await captureVideoThumbnail(objectUrl, duration);

      videoObjectUrlRef.current = objectUrl;
      setUploadedVideo({
        file,
        fileName: file.name,
        duration,
        durationLabel: formatDuration(duration),
        sizeLabel: formatFileSize(file.size),
        thumbnailUrl,
        objectUrl,
      });
      setSelectedFile(file);
      setUploadStatus('success');
      setUploadError(null);
    } catch {
      URL.revokeObjectURL(objectUrl);
      triggerUploadError('동영상 파일만 업로드할 수 있습니다');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) void processVideoFile(file);
  };

  const handleUploadDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsUploadDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processVideoFile(file);
  };

  return (
    <motion.div
      className={cn('flex min-h-screen flex-col items-center px-16 pt-9 pb-20 bg-white w-full')}
      variants={containerStagger}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? undefined : 'visible'}
    >
      <motion.div className={cn('flex w-full items-center will-change-[transform,opacity]', useEmptyStateDesign ? 'mb-10' : 'mb-8')} variants={fadeInUp}>
        <Logo height={40} />
      </motion.div>

      <motion.div className={cn('text-center mb-10')} variants={containerStagger}>
        <motion.div className="will-change-[transform,opacity]" variants={fadeInUp}>
          <MonoLabel className={cn('block mb-4')}>AI Video Editor</MonoLabel>
        </motion.div>
        <motion.h1
          className={cn('leading-[1.08] will-change-[transform,opacity] mb-[18px] text-[52px] font-semibold tracking-[-1.2px]')}
          variants={fadeInUp}
        >
          영상 편집 시작하기
        </motion.h1>
        <motion.p
          className={cn('font-[320] tracking-[-0.2px] will-change-[transform,opacity] text-[17px] leading-[1.55] text-[rgba(0,0,0,0.45)]')}
          variants={fadeInUp}
        >
          원본 영상을 업로드하고, 편집할 장면 순서를 입력하면
          <br />
          AI가 하이라이트 편집을 자동으로 진행합니다.
        </motion.p>
      </motion.div>

      <motion.div className="mb-5 flex w-full items-center gap-3 will-change-[transform,opacity]" variants={fadeInUp}>
        {[
          ['1', '영상 업로드', false],
          ['2', '시나리오 입력', false],
          ['3', '편집 시작', true],
        ].map(([step, label, muted], index) => (
          <Fragment key={`${step}-${label}`}>
            <div className="flex items-center gap-2">
              <div className={cn('flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px]', muted ? 'bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.2)]' : 'bg-[rgba(0,0,0,0.07)] text-[rgba(0,0,0,0.35)]')}>{step}</div>
              <span className={cn('text-[12.5px] tracking-[-0.1px]', muted ? 'text-[rgba(0,0,0,0.25)]' : 'text-[rgba(0,0,0,0.4)]')}>{label}</span>
            </div>
            {index < 2 && <div className="h-px flex-1 bg-[rgba(0,0,0,0.08)]" />}
          </Fragment>
        ))}
      </motion.div>

      <motion.div className={cn('upload-panels grid w-full grid-cols-2 gap-4 max-[900px]:grid-cols-1', useEmptyStateDesign ? 'mb-8' : 'mb-10')} variants={containerStagger}>
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
                  <video
                    className="h-full w-full object-contain"
                    src={uploadedVideo.objectUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />
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
                          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] transition-all" style={{ background: isUploadDragActive ? `${accent}22` : 'rgba(0,0,0,0.05)' }}>
                            <UploadCloudIcon active={isUploadDragActive} accent={accent} />
                          </div>
                          <div className="text-center">
                            <div className="mb-1.5 text-[15px] font-medium tracking-[-0.2px] transition-colors" style={{ color: isUploadDragActive ? accent : 'rgba(0,0,0,0.65)' }}>
                              {isUploadDragActive ? '여기에 놓으세요' : '영상을 업로드하세요'}
                            </div>
                            <div id={`${fileInputId}-hint`} className="mb-3 text-[12.5px] leading-[1.5] tracking-[-0.1px] text-[rgba(0,0,0,0.34)]">
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
                              <span key={format} className="rounded border border-[rgba(0,0,0,0.07)] bg-[rgba(0,0,0,0.04)] px-[7px] py-0.5 font-mono text-[10.5px] text-[rgba(0,0,0,0.28)]">
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

        <motion.section
          className={cn('flex flex-col bg-white', useEmptyStateDesign ? 'rounded-[14px]' : 'rounded-xl', panelPadding)}
          style={{
            border: items.length === 0 ? '1px dashed rgba(0,0,0,0.14)' : '1px solid rgba(0,0,0,0.1)',
            transition: 'background-color 0.18s ease, border-color 0.18s ease',
          }}
          variants={fadeInUp}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: useEmptyStateDesign ? 'rgba(0,0,0,0.18)' : accent }} />
            <MonoLabel>02 - 편집 시나리오 입력</MonoLabel>
          </div>
          <p className={cn('mb-5 text-[13px] tracking-[-0.1px]', useEmptyStateDesign ? 'leading-[1.55] text-[rgba(0,0,0,0.38)]' : 'text-[rgba(0,0,0,0.4)]')}>
            영상에서 추출할 장면의 순서를 입력해 주세요.
          </p>

          <>
            {items.length === 0 ? (
            <div
              className="mb-3.5 flex flex-1 flex-col items-center justify-center gap-3.5 rounded-[10px] border border-dashed border-[rgba(0,0,0,0.09)] bg-[rgba(0,0,0,0.022)] px-6 py-8"
            >
              <div className="relative h-11 w-[60px]">
                {[2, 1, 0].map((stack) => (
                  <div
                    key={stack}
                    className="absolute h-7 rounded-[7px] border border-[rgba(0,0,0,0.07)]"
                    style={{
                      top: stack * 4,
                      left: stack * 4,
                      right: -(stack * 4),
                      background: stack === 0 ? 'rgba(0,0,0,0.06)' : stack === 1 ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.025)',
                    }}
                  />
                ))}
              </div>
              <div className="text-center">
                <div className="mb-[5px] text-sm font-[490] tracking-[-0.2px] text-[rgba(0,0,0,0.4)]">아직 입력된 장면이 없어요</div>
                <div className="text-[12.5px] leading-[1.5] tracking-[-0.1px] text-[rgba(0,0,0,0.28)]">
                  아래 입력창에 장면 이름을 입력하고
                  <br />
                  Enter 또는 + 버튼으로 추가하세요.
                </div>
              </div>
            </div>
          ) : (
            <div
              className="mb-3 flex flex-1 flex-col gap-[5px]"
            >
              {items.map((item, index) => {
                const isHovered = hoverItem === item.id;
                const isDragging = draggingItem === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    draggable
                    onDragStart={() => setDraggingItem(item.id)}
                    onDragOver={(event) => handleDragOver(event, item.id)}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => {
                      setDraggingItem(null);
                      setHoverItem(null);
                    }}
                    className="flex cursor-grab items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-[border-color,background,transform,box-shadow,opacity]"
                    style={{
                      background: isHovered ? accentTint : isDragging ? 'rgba(0,0,0,0.025)' : '#fff',
                      border: `1px solid ${isHovered ? accent : isDragging ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: isHovered ? `0 4px 12px ${accent}22` : 'none',
                      opacity: isDragging ? 0.4 : 1,
                      transform: isHovered ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <div className="flex shrink-0 cursor-grab items-center pr-0.5 opacity-25 transition-opacity hover:opacity-60">
                      <DragDots />
                    </div>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-all"
                      style={{
                        background: isHovered ? accent : 'rgba(0,0,0,0.06)',
                        color: isHovered ? '#fff' : 'rgba(0,0,0,0.4)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 text-[13.5px] tracking-[-0.1px]">{item.ko}</span>
                    <button
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent opacity-25 transition-opacity hover:opacity-70"
                      onClick={() => removeScenarioItem(item.id)}
                      type="button"
                      aria-label={`${item.ko} 삭제`}
                    >
                      <Icon d={icons.trash} size={12} stroke="#000" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
          </>

          <div className="mt-auto flex gap-2">
            <div
              className="flex flex-1 items-center gap-2 rounded-[10px] bg-white px-3.5 py-2.5 transition-colors"
              style={{ border: `1.5px solid ${isScenarioInputFocused ? accent : 'rgba(0,0,0,0.12)'}` }}
            >
              <Icon d={icons.plus} size={14} stroke={isScenarioInputFocused ? accent : 'rgba(0,0,0,0.28)'} />
              <input
                ref={scenarioInputRef}
                className="flex-1 border-0 bg-transparent text-[13.5px] tracking-[-0.1px] text-black outline-none placeholder:text-[rgba(0,0,0,0.28)]"
                onBlur={() => setIsScenarioInputFocused(false)}
                onChange={(event) => setScenarioInputValue(event.target.value)}
                onFocus={() => setIsScenarioInputFocused(true)}
                onKeyDown={handleScenarioKeyDown}
                placeholder="찾고 싶은 장면을 입력하세요"
                value={scenarioInputValue}
              />
            </div>
            <button
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] border-0 transition-colors"
              onClick={() => addScenarioItem()}
              style={{
                background: scenarioInputValue.trim() ? accent : 'rgba(0,0,0,0.07)',
                cursor: scenarioInputValue.trim() ? 'pointer' : 'default',
              }}
              type="button"
              aria-label="장면 추가"
            >
              <Icon d={icons.plus} size={16} stroke={scenarioInputValue.trim() ? '#fff' : 'rgba(0,0,0,0.3)'} strokeWidth={3} />
            </button>
          </div>
        </motion.section>
      </motion.div>

      <motion.div className="will-change-[transform,opacity]" variants={fadeInUp}>
        {submitError && <p className="mb-3 text-center text-[12px] font-[480] tracking-[-0.1px] text-[#E0285A]">{submitError}</p>}
        <motion.div
          className="inline-block rounded-full"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  boxShadow:
                    canStartEditing && !isSubmitting
                      ? ['0 0 0 rgba(0,0,0,0)', `0 10px 28px ${accent}24`, `0 6px 18px ${accent}18`]
                      : [`0 6px 18px ${accent}18`, '0 0 0 rgba(0,0,0,0)', '0 0 0 rgba(0,0,0,0)'],
                }
          }
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <PillButton
            variant="accent"
            onClick={startHighlightAnalysis}
            icon="wand"
            disabled={!canStartEditing || isSubmitting}
            className="px-10 py-3.5 [font-family:'Plus_Jakarta_Sans','Noto_Sans_KR',sans-serif] text-base font-bold tracking-[-0.3px]"
          >
            {isSubmitting ? '분석 요청 중...' : '영상 편집 시작하기'}
          </PillButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
