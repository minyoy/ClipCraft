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
        if not candidates:
            return {"start": 0.0, "end": 0.0, "reason": "No candidates", "best_idx": -1}
        
        target_dir = clip_folder if clip_folder else os.path.join("./output", scenario_text.replace(" ", "_"))
        best_idx = -1
        max_score = -1.0
        best_reason = ""

        # 1. 'Yes/No' 판단을 위한 토큰 ID 미리 추출
        yes_token_id = self.processor.tokenizer.convert_tokens_to_ids("Yes")
        no_token_id = self.processor.tokenizer.convert_tokens_to_ids("No")

        for idx, cand in enumerate(candidates):
            clip_path = cand.get('clip_path')
            # ... (파일 경로 확인 로직 동일) ...

            try:
                container = av.open(clip_path)
                total_frames = container.streams.video[0].frames
                indices = np.arange(0, total_frames, max(1, total_frames / 12)).astype(int)
                video_frames = self._read_video_pyav(container, indices)

                # 2. 더 정교한 프롬프트 (전문적인 분석 유도)
                prompt = (
                    f"USER: <video>\n"
                    f"Task: Critically verify if this clip shows '{scenario_text}'.\n"
                    f"Does the visual evidence match the description? Answer: ASSISTANT:"
                )
                
                inputs = self.processor(text=prompt, videos=video_frames, return_tensors="pt").to(self.device)
                
                with torch.no_grad():
                    # 3. Logits 직접 추출 (이게 핵심!)
                    outputs = self.model(**inputs)
                    # 마지막 토큰 위치의 로짓값 추출
                    last_token_logits = outputs.logits[:, -1, :]
                    
                    # 'Yes'와 'No' 토큰에 할당된 확률 계산
                    probs = torch.softmax(last_token_logits, dim=-1)
                    yes_prob = probs[0, yes_token_id].item()
                    no_prob = probs[0, no_token_id].item()

                    # 코사인 유사도처럼 0~1 사이의 정밀한 점수 생성 (Yes 확률 기반)
                    # 단순히 텍스트로 "10점" 하는 것보다 훨씬 수학적으로 정확함
                    refined_score = yes_prob * 10 

                # 4. 분석 내용(Reason)은 별도로 generate해서 가져오기
                gen_ids = self.model.generate(**inputs, max_new_tokens=50)
                reason_text = self.processor.batch_decode(gen_ids, skip_special_tokens=True)[0]
                reason_text = reason_text.split("ASSISTANT:")[-1].strip()

                print(f"   [Clip {idx+1}] 확률점수: {refined_score:.2f} | 분석: {reason_text[:30]}...")
                
                if refined_score > max_score:
                    max_score = refined_score
                    best_idx = idx
                    best_reason = reason_text

            except Exception as e:
                print(f"⚠️ 에러 발생: {e}")
                continue

        if best_idx != -1:
            final_cand = candidates[best_idx]
            return {
                "start": final_cand.get('start', 0.0),
                "end": final_cand.get('end', 0.0),
                "reason": best_reason,
                "best_idx": best_idx,
                "confidence": max_score / 10 # 0~1 사이 신뢰도 추가
            }
        return {"start": 0.0, "end": 0.0, "reason": "Not found", "best_idx": -1}

