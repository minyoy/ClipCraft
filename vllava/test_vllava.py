import sys
sys.path.insert(0, "/shareHost/jiyes/packages")

from vllava import VideoLLaVAVerifier

verifier = VideoLLaVAVerifier()

# 테스트할 클립 경로랑 시나리오 여기 넣으면 돼
candidates = [
    {"clip_path": "/home/CC_project/ClipCraft/clip_search/clips/test/sc1_put_green_vegetable_into_the_p/put_green_vegetable_into_the_pot/example_clip01.mp4", "start": 28.8, "end": 34.8},
    {"clip_path": "/home/CC_project/ClipCraft/clip_search/clips/test/sc1_put_green_vegetable_into_the_p/put_green_vegetable_into_the_pot/example_clip02.mp4", "start": 44.8, "end": 50.8},
    {"clip_path": "/home/CC_project/ClipCraft/clip_search/clips/test/sc1_put_green_vegetable_into_the_p/put_green_vegetable_into_the_pot/example_clip03.mp4", "start": 54.7, "end": 72.7},
]

result = verifier.verify_timestamp(
    video_path=None,
    scenario_text="put green vegetable into the pot",
    candidates=candidates,
)

print("최종 결과:", result)