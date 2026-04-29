import torch
from transformers import VideoLlavaForConditionalGeneration, VideoLlavaProcessor, BitsAndBytesConfig
import av
import numpy as np
import os
import re

class VideoLLaVAVerifier:
    def __init__(self):
        """
        모델 로드 및 초기화 (지예님의 GPU 서버 환경 반영)
        """
        self.model_id = "LanguageBind/Video-LLaVA-7B-hf"
        self.cache_path = "/shareHost/jiye_model"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # GPU 메모리(VRAM) 최적화를 위한 4-bit 양자화 설정
        # CLIP과 동시에 GPU를 사용할 때 OOM(Out of Memory)을 방지합니다.
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

    def verify_timestamp(self, video_path, scenario_text):
        """
        CLIP이 찾은 후보 영상 내에서 시나리오에 해당하는 정확한 [시작, 끝] 초를 반환합니다.
        """
        if not os.path.exists(video_path):
            print(f"❌ 영상을 찾을 수 없습니다: {video_path}")
            return 0.0, 0.0

        try:
            container = av.open(video_path)
            total_frames = container.streams.video[0].frames
            
            # 영상 전체에서 8개 프레임 균등 추출
            indices = np.arange(0, total_frames, max(1, total_frames / 8)).astype(int)
            video_frames = self._read_video_pyav(container, indices)
            
            if video_frames is None:
                return 0.0, 0.0

            # Temporal Grounding을 유도하는 프롬프트
            prompt = (
                f"USER: <video>\nIn this video, exactly when does the following action occur: '{scenario_text}'? "
                "Provide the start and end times in seconds as a list: [start_time, end_time]. "
                "If not present, respond [0.0, 0.0]. ASSISTANT:"
            )
            
            # 추론 수행
            inputs = self.processor(text=prompt, videos=video_frames, return_tensors="pt").to(self.device)
            if self.device == "cuda":
                inputs = {k: v.to(torch.float16) if v.dtype == torch.float32 else v for k, v in inputs.items()}

            generate_ids = self.model.generate(**inputs, max_new_tokens=100)
            answer = self.processor.batch_decode(generate_ids, skip_special_tokens=True)[0]
            
            # 답변 파싱 (정규표현식으로 숫자 리스트 추출)
            res_text = answer.split("ASSISTANT:")[-1].strip()
            numbers = re.findall(r"[-+]?\d*\.\d+|\d+", res_text)
            
            if len(numbers) >= 2:
                start, end = float(numbers[0]), float(numbers[1])
                return max(0.0, start), max(0.0, end)
            
            return 0.0, 0.0

        except Exception as e:
            print(f"⚠️ V-LLaVA 분석 중 에러 발생: {e}")
            return 0.0, 0.0