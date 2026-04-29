import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../App';
import MonoLabel from '../components/MonoLabel';
import PillButton from '../components/PillButton';
import UploadHeader from '../components/UploadScreen/UploadHeader';
import StepIndicator from '../components/UploadScreen/StepIndicator';
import VideoUploadPanel from '../components/UploadScreen/VideoUploadPanel';
import ScenarioPanel from '../components/UploadScreen/ScenarioPanel';
import { containerStagger, fadeInUp } from '../lib/animations';
import { cn } from '../lib/cn';
import { captureVideoThumbnail, formatDuration, formatFileSize, isVideoFile, loadVideoDuration, MAX_VIDEO_DURATION_SECONDS } from '../lib/videoUpload';
import type { ScenarioItem } from '../types/app';
import type { UploadedVideo, UploadScreenProps, UploadStatus } from '../types/pages/UploadScreen';

export default function UploadFlow({ onNext }: UploadScreenProps) {
  const { accent, density } = useTheme();
  const fileInputId = useId();
  const shouldReduceMotion = useReducedMotion();
  const panelPadding = density === 'compact' ? 'p-5' : density === 'spacious' ? 'p-9' : 'p-7';
  const accentTint = `${accent}18`;

  const [projectName, setProjectName] = useState('');
  const [isProjectNameFocused, setIsProjectNameFocused] = useState(false);
  const [items, setItems] = useState<ScenarioItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const videoObjectUrlRef = useRef<string | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (videoObjectUrlRef.current) URL.revokeObjectURL(videoObjectUrlRef.current);
    };
  }, []);

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

  const triggerUploadError = (message: string) => {
    setUploadError(message);
    setUploadStatus('idle');
    setSelectedFile(null);
    setUploadedVideo(null);
  };

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
      setUploadedVideo({ file, fileName: file.name, duration, durationLabel: formatDuration(duration), sizeLabel: formatFileSize(file.size), thumbnailUrl, objectUrl });
      setSelectedFile(file);
      setUploadStatus('success');
      setUploadError(null);
    } catch {
      URL.revokeObjectURL(objectUrl);
      triggerUploadError('동영상 파일만 업로드할 수 있습니다');
    }
  };

  const startHighlightAnalysis = () => {
    if (!uploadedVideo || !canStartEditing) return;
    videoObjectUrlRef.current = null;
    onNext({
      file: uploadedVideo.file,
      projectName: projectName.trim() || uploadedVideo.fileName.replace(/\.[^/.]+$/, '') || uploadedVideo.fileName,
      scenarios: items,
      videoUrl: uploadedVideo.objectUrl,
      videoName: uploadedVideo.fileName,
    });
  };

  const handleItemsChange = useCallback((updated: ScenarioItem[]) => {
    setItems(updated);
  }, []);

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center px-16 pt-9 pb-20 bg-white w-full"
      variants={containerStagger}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? undefined : 'visible'}
    >
      <UploadHeader useEmptyStateDesign={useEmptyStateDesign} />

      <motion.div className="mb-10 flex w-full flex-col gap-2.5 will-change-[transform,opacity]" variants={fadeInUp}>
        <MonoLabel className="text-[15px] font-[500] tracking-[0.5px]">프로젝트 이름</MonoLabel>
        <div
          className="flex items-center rounded-[10px] bg-white px-3.5 py-2.5 transition-[border-color,box-shadow]"
          style={{
            border: `1.5px solid ${isProjectNameFocused ? accent : 'rgba(0,0,0,0.12)'}`,
            boxShadow: isProjectNameFocused ? `0 0 0 3px ${accent}08` : 'none',
          }}
        >
          <input
            className="flex-1 border-0 bg-transparent text-sm tracking-[-0.1px] text-black outline-none placeholder:text-[rgba(0,0,0,0.28)]"
            onBlur={() => setIsProjectNameFocused(false)}
            onChange={(event) => setProjectName(event.target.value)}
            onFocus={() => setIsProjectNameFocused(true)}
            placeholder="예: 김치찌개 요리 브이로그"
            type="text"
            value={projectName}
          />
        </div>
      </motion.div>

      <StepIndicator />

      <motion.div
        className={cn('upload-panels grid w-full grid-cols-2 gap-4 max-[900px]:grid-cols-1', useEmptyStateDesign ? 'mb-8' : 'mb-10')}
        variants={containerStagger}
      >
        <VideoUploadPanel
          accent={accent}
          panelPadding={panelPadding}
          accentTint={accentTint}
          fileInputId={fileInputId}
          hasUploadedVideo={hasUploadedVideo}
          uploadedVideo={uploadedVideo}
          uploadStatus={uploadStatus}
          uploadError={uploadError}
          uploadPct={uploadPct}
          selectedFile={selectedFile}
          useEmptyStateDesign={useEmptyStateDesign}
          onFileSelect={(file) => void processVideoFile(file)}
        />
        <ScenarioPanel
          accent={accent}
          panelPadding={panelPadding}
          accentTint={accentTint}
          useEmptyStateDesign={useEmptyStateDesign}
          onItemsChange={handleItemsChange}
        />
      </motion.div>

      <motion.div className="will-change-[transform,opacity]" variants={fadeInUp}>
        <motion.div
          className="inline-block rounded-full"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  boxShadow: canStartEditing
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
            disabled={!canStartEditing}
            className="px-10 py-3.5 [font-family:'Plus_Jakarta_Sans','Noto_Sans_KR',sans-serif] text-base font-bold tracking-[-0.3px]"
          >
            영상 편집 시작하기
          </PillButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
