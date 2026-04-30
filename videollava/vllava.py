import torch
from transformers import VideoLlavaForConditionalGeneration, VideoLlavaProcessor, BitsAndBytesConfig
import av
import numpy as np
import os
import re

class VideoLLaVAVerifier:
    def __init__(self):
        """
        모델 로드 및 초기화 (GPU 서버 환경 반영)
        """
        self.model_id = "LanguageBind/Video-LLaVA-7B-hf"
        self.cache_path = "/shareHost/jiye_model"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # GPU 메모리(VRAM) 최적화를 위한 4-bit 양자화 설정
        # CLIP과 동시에 GPU를 사용할 때 OOM(Out of Memory) 방지
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )

        print(f"🔄 Video-LLaVA 모델 로드 중... (경로: {self.cache_path})")
        self.processor = VideoLlavaProcessor.from_pretrained(self.model_id, cache_dir=self.cache_path)
        self.model = VideoLlavaForConditionalGeneration.from_pretrained(
            self.model_id, 
            cache_dir=self.cache_path,
            quantization_config=bnb_config if self.device == "cuda" else None,
            device_map="auto" if self.device == "cuda" else None
        )
        print("✅ Video-LLaVA 로드 완료!")

    def _read_video_pyav(self, container, indices):
        """
        vllava_logic.py에서 사용한 PyAV 기반 프레임 추출 로직
        """
        frames = []
        container.seek(0)
        for i, frame in enumerate(container.decode(video=0)):
            if i in indices:
                frames.append(frame.to_ndarray(format="rgb24"))
        if len(frames) == 0:
            return None
        return np.stack(frames)

    def verify_timestamp(self, video_path, scenario_text, candidates=None, clip_folder=None):
        """
        CLIP이 생성한 개별 클립 파일들을 하나씩 읽어서 시나리오에 맞는지 검증합니다.
        """
        if not candidates:
            print("❌ [VLLaVA] 분석할 후보 클립 정보가 없습니다.")
            return 0.0, 0.0
        
        # 1. 경로 설정: gpu_server에서 넘겨준 실제 경로를 우선 사용[cite: 1]
        target_dir = clip_folder if clip_folder else os.path.join("./output", scenario_text.replace(" ", "_"))

        best_idx = -1
        max_score = -1.0

        print(f"📂 [VLLaVA] 클립 저장 폴더 접근: {target_dir}")

        for idx, cand in enumerate(candidates):
            # 파일명 규칙: example_clip01.mp4, 02.mp4...
            clip_path = cand.get('clip_path')

            # 만약 clip_path가 없으면 예전처럼 파일명을 추측해서 조합
            if not clip_path or not os.path.exists(clip_path):
                clip_filename = f"example_clip{str(idx+1).zfill(2)}.mp4"
                clip_path = os.path.join(target_dir, clip_filename)

            if not os.path.exists(clip_path):
                print(f"⚠️ [VLLaVA] 파일을 찾을 수 없음: {clip_path}")
                continue

            try:
                # 1. 개별 클립 파일 열기
                container = av.open(clip_path)
                total_frames = container.streams.video[0].frames
                
                # 클립 내에서 8개 프레임 추출
                indices = np.arange(0, total_frames, max(1, total_frames / 12)).astype(int)
                video_frames = self._read_video_pyav(container, indices)

                if video_frames is None: 
                    continue

                # 2. VLLaVA에게 이 짧은 클립이 정답인지 물어보기
                prompt = (
                    f"USER: <video>\n"
                    f"Analyze this clip strictly. Does it clearly show the specific action: '{scenario_text}'?\n"
                    "Look for definitive visual evidence (e.g., the container opening, the liquid falling, or the exact hand movement).\n"
                    "If the action is vague or missing, give a low score. If it's perfectly captured, give a high score.\n"
                    "Rate the relevance from 0 to 10. Respond ONLY with 'Score: X' (e.g., Score: 9.5). ASSISTANT:"
                )
                
                inputs = self.processor(text=prompt, videos=video_frames, return_tensors="pt").to(self.device)
                if self.device == "cuda":
                    inputs = {k: v.to(torch.float16) if v.dtype == torch.float32 else v for k, v in inputs.items()}

                generate_ids = self.model.generate(**inputs, max_new_tokens=50)
                answer = self.processor.batch_decode(generate_ids, skip_special_tokens=True)[0]
                res_text = answer.split("ASSISTANT:")[-1].strip()

                # 점수 파싱 (예: Score: 9 -> 9.0)[cite: 2]
                match = re.search(r"score(?:\s+is|:)\s*(\d+\.?\d*)", res_text, re.IGNORECASE)
                score = float(match.group(1)) if match else 0.0
                
                print(f"   => 검증 점수: {score}/10")

                if score > max_score:
                    max_score = score
                    best_idx = idx

            except Exception as e:
                print(f"⚠️ [VLLaVA] {clip_filename} 분석 중 에러: {e}")
                continue

        # 3. 가장 높은 점수를 받은 클립의 원래 시간대 반환[cite: 1]
        if best_idx != -1:
            final_cand = candidates[best_idx]
            print(f"✅ [VLLaVA] 최종 선택된 클립: {best_idx+1}번 (점수: {max_score})")
            return final_cand.get('start', 0.0), final_cand.get('end', 0.0)
        
        return 0.0, 0.0

