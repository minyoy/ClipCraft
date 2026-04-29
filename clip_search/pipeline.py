"""CLI and composition root for the modular video analysis pipeline."""

import argparse
import json

from clip_search.orchestration.pipeline import VideoSearchPipeline
from services import (
    ClipEmbedder,
    OpenAIQueryExpander,
    OpenCVClipSaver,
    OpenCVFrameSampler,
    SegmentDetector,
    SimilarityAnalyzer,
)


def build_pipeline(
    fps: float = 2.0,
    batch_size: int = 32,
    clip_model: str = "ViT-L/14",
) -> VideoSearchPipeline:
    query_expander = OpenAIQueryExpander()
    embedder = ClipEmbedder(model_name=clip_model)
    frame_sampler = OpenCVFrameSampler()
    similarity_computer = SimilarityAnalyzer(
        query_expander=query_expander,
        embedder=embedder,
        batch_size=batch_size,
    )
    segment_extractor = SegmentDetector(
        smooth_window=5,
        min_duration=2.0,
        top_k=3,
        merge_gap=2.0,
    )
    clip_saver = OpenCVClipSaver()

    return VideoSearchPipeline(
        frame_sampler=frame_sampler,
        similarity_computer=similarity_computer,
        segment_extractor=segment_extractor,
        clip_saver=clip_saver,
        frame_sample_fps=fps,
        clip_model=clip_model,
    )


def run_pipeline(
    video_path: str,
    query: str,
    output_dir: str = ".",
    fps: float = 2.0,
    batch_size: int = 32,
    clip_model: str = "ViT-L/14",
) -> dict:
    """Backward-compatible wrapper returning segment dicts."""
    return build_pipeline(fps=fps, batch_size=batch_size, clip_model=clip_model).run(
        video_path=video_path,
        query=query,
        output_dir=output_dir,
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract video segments matching a Korean text query."
    )
    parser.add_argument("--video", required=True, help="Path to input video file")
    parser.add_argument("--query", required=True, help="Korean scene description")
    parser.add_argument(
        "--output-dir",
        default="./clips",
        help="Directory to save output clips (default: current dir)",
    )
    parser.add_argument("--fps", type=float, default=2.0, help="Frame sampling FPS")
    parser.add_argument("--batch-size", type=int, default=32, help="CLIP image batch size")
    parser.add_argument("--clip-model", default="ViT-L/14", help="CLIP model name")
    args = parser.parse_args()

    result = run_pipeline(
        args.video,
        args.query,
        output_dir=args.output_dir,
        fps=args.fps,
        batch_size=args.batch_size,
        clip_model=args.clip_model,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
