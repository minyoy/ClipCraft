import torch
from transformers import VideoLlavaForConditionalGeneration, VideoLlavaProcessor
import av
import numpy as np
import os

# 1. 모델 및 프로세서 로드 (GPU 사용 설정)
model_id = "LanguageBind/Video-LLaVA-7B-hf"
processor = VideoLlavaProcessor.from_pretrained(model_id)
model = VideoLlavaForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    device_map="auto" # 서버의 4090 GPU를 자동으로 할당
)

# 2. 영상 프레임 추출 함수
def read_video_pyav(container, indices):
    frames = []
    container.seek(0)
    for i, frame in enumerate(container.decode(video=0)):
        if i in indices:
            frames.append(frame.to_nd_array(format="rgb24"))
    return np.stack(frames)

# 3. 경로 설정 (vllava 폴더 안에서 상위의 clip_search/clips 폴더를 찾는 로직)
current_file_path = os.path.dirname(os.path.abspath(__file__)) # vllava 폴더 위치
project_root = os.path.dirname(current_file_path)             # CLIPCRAFT 폴더 위치

# 분석하고 싶은 영상 파일명을 아래 리스트에 넣으세요 (사진에 있던 파일명들)
# 예시로 하나만 넣었으니, 실제 파일명으로 수정해주세요!
target_video_name = "example_clip01.mp4" 
video_path = os.path.join(project_root, "clip_search", "clips", "pouring_oyster_sauce_into_a_bowl", target_video_name)

# 4. 영상 존재 여부 확인 및 분석 실행
if os.path.exists(video_path):
    print(f"✅ 분석 시작: {video_path}")
    
    container = av.open(video_path)
    total_frames = container.streams.video[0].frames
    # 영상을 8개의 프레임으로 나누어 분석 (모델 입력 표준)
    indices = np.arange(0, total_frames, total_frames / 8).astype(int)
    video = read_video_pyav(container, indices)

    # 5. V-LLaVA에게 던지는 질문 (졸업 작품 핵심 동작 검증)
    # 질문 내용을 원하는 대로 수정하셔도 됩니다!
    prompt = (
        "USER: <video>\n"
        "Is the person in this video specifically pouring 'oyster sauce' into the bowl? "
        "Or is it some other ingredient? "
        "Analyze the color and texture of the sauce and answer. "
        "ASSISTANT:"
)
    # 모델 입력 준비
    inputs = processor(text=prompt, videos=video, return_tensors="pt").to("cuda", torch.float16)
    
    # 답변 생성
    generate_ids = model.generate(**inputs, max_new_tokens=200)
    answer = processor.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]

    print("\n" + "="*50)
    print("🚀 [V-LLaVA 분석 결과]")
    print(answer)
    print("="*50)

else:
    print(f"❌ 영상을 찾을 수 없습니다. 경로를 확인해주세요: {video_path}")
    # 현재 폴더 위치를 출력해서 경로 확인을 도와줌
    print(f"현재 위치: {os.getcwd()}")