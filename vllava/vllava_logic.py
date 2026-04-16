import torch
from transformers import VideoLlavaForConditionalGeneration, VideoLlavaProcessor
import av
import numpy as np
import os

# 1. 모델 로드 (지예님의 /shareHost 경로)
model_id = "LanguageBind/Video-LLaVA-7B-hf"
cache_path = "/shareHost/jiye_model"

print("🔄 모델 로드 시작...")
processor = VideoLlavaProcessor.from_pretrained(model_id, cache_dir=cache_path)
model = VideoLlavaForConditionalGeneration.from_pretrained(
    model_id, 
    cache_dir=cache_path,
    torch_dtype=torch.float16, 
    device_map="auto"
)
print("✅ Model loaded successfully!")

# 2. 영상 프레임 추출 (에러 고친 버전)
def read_video_pyav(container, indices):
    frames = []
    container.seek(0)
    for i, frame in enumerate(container.decode(video=0)):
        if i in indices:
            frames.append(frame.to_ndarray(format="rgb24"))
    return np.stack(frames)

# 3. 경로 설정
target_video_name = "example_clip01.mp4" 
video_path = f"/home/vllava_docker/ClipCraft/clip_search/clips/pouring_oyster_sauce_into_a_bowl/{target_video_name}"

# 4. 분석 실행
if os.path.exists(video_path):
    print(f"🚀 분석 시작: {video_path}")
    container = av.open(video_path)
    total_frames = container.streams.video[0].frames
    indices = np.arange(0, total_frames, total_frames / 8).astype(int)
    video = read_video_pyav(container, indices)

    # 💡 질문을 '굴소스' 언급 없이 중립적으로 변경!
    prompt = (
        "USER: <video>\n"
        "Describe the main action in this video in detail. "
        "What specific ingredient is the person adding to the dish? "
        "Is it a liquid sauce or a green vegetable? "
        "ASSISTANT:"
    )
    
    inputs = processor(text=prompt, videos=video, return_tensors="pt").to("cuda", torch.float16)
    generate_ids = model.generate(**inputs, max_new_tokens=200)
    answer = processor.batch_decode(generate_ids, skip_special_tokens=True)[0]

    print("\n🎬 [재분석 결과]\n", answer)
else:
    print(f"❌ 영상을 찾을 수 없습니다.")