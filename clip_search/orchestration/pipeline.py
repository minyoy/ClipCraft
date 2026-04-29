import os
import re
import hashlib
from typing import List

import numpy as np

from clip_search.core.models import Segment
from clip_search.core.protocols import ClipSaver, FrameSampler, SegmentExtractor, SimilarityComputer


class VideoSearchPipeline:
    def __init__(
        self,
        frame_sampler: FrameSampler,
        similarity_computer: SimilarityComputer,
        segment_extractor: SegmentExtractor,
        clip_saver: ClipSaver,
        frame_sample_fps: float = 1.0,
        clip_model: str = "ViT-L/14",
    ) -> None:
        self._frame_sampler = frame_sampler
        self._similarity_computer = similarity_computer
        self._segment_extractor = segment_extractor
        self._clip_saver = clip_saver
        self._frame_sample_fps = frame_sample_fps
        self._clip_model = clip_model

    def run(self, video_path: str, query: str, output_dir: str = ".") -> dict:
        frames, timestamps = self._frame_sampler.sample(video_path, fps=self._frame_sample_fps)
        cache_key = self._build_embedding_cache_key(video_path)
        similarities, english_query = self._similarity_computer.compute_similarity_curve(
            frames,
            query,
            cache_key=cache_key,
        )
        segments = self._segment_extractor.extract(similarities, timestamps)

        self._print_similarity_stats(similarities, segments)
        self._print_results(segments)

        if segments:
            query_dir = self._build_query_output_dir(output_dir, english_query, query)
            saved_paths = self._clip_saver.save(video_path, segments, output_dir=query_dir)
            for segment, clip_path in zip(segments, saved_paths):
                segment.clip_path = clip_path

        return {
            "expandedQuery": english_query,
            "segments": [
                {
                    "start": segment.start,
                    "end": segment.end,
                    "max_score": segment.max_score,
                    "clip_path": segment.clip_path,
                }
                for segment in segments
            ],
        }

    def _build_embedding_cache_key(self, video_path: str) -> str:
        stat = os.stat(video_path)
        raw = "|".join(
            [
                os.path.abspath(video_path),
                str(stat.st_size),
                str(stat.st_mtime_ns),
                f"{self._frame_sample_fps:.6f}",
                self._clip_model,
            ]
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]

    @staticmethod
    def _build_query_output_dir(output_dir: str, english_query: str, fallback_query: str) -> str:
        representative_query = english_query or fallback_query
        safe_query = re.sub(r"[\\/:*?\"<>|]", "", representative_query).strip().replace(" ", "_")[:40]
        if not safe_query:
            safe_query = "query"
        return os.path.join(output_dir, safe_query)

    @staticmethod
    def _print_similarity_stats(similarities: np.ndarray, segments: List[Segment]) -> None:
        if similarities.size == 0:
            print("[clip] no frames extracted. similarity statistics unavailable.")
            print("[clip] segments found: 0")
            return

        print(f"[clip] max score: {similarities.max():.3f}")
        print(f"[clip] mean: {similarities.mean():.3f}, std: {similarities.std():.3f}")
        print(f"[clip] threshold: {similarities.mean() + 0.5 * similarities.std():.3f}")
        print(f"[clip] segments found: {len(segments)}")
        for index, segment in enumerate(segments, start=1):
            print(f"  [{index}] {segment.start:.1f}s ~ {segment.end:.1f}s | score: {segment.max_score:.3f}")

    @staticmethod
    def _print_results(segments: List[Segment]) -> None:
        print("\n=== Results ===")
        if not segments:
            print("No matching segments found.")
        for index, segment in enumerate(segments, start=1):
            print(
                f"  [{index}] {segment.start:6.1f}s - {segment.end:6.1f}s "
                f"(score: {segment.max_score:.4f})"
            )
        print()
