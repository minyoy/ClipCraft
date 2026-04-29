from typing import List, Protocol, Sequence, Tuple, Optional

import numpy as np
import torch

from clip_search.core.models import Segment


class QueryExpander(Protocol):
    def expand(self, korean_query: str) -> str:
        ...


class VisionTextEmbedder(Protocol):
    def encode_text(self, queries: Sequence[str]) -> torch.Tensor:
        ...

    def encode_frame_batch(self, frames: Sequence[np.ndarray]) -> torch.Tensor:
        ...


class FrameSampler(Protocol):
    def sample(self, video_path: str, fps: float) -> Tuple[List[np.ndarray], List[float]]:
        ...


class SimilarityComputer(Protocol):
    def compute_similarity_curve(
        self,
        frames: List[np.ndarray],
        korean_query: str,
        cache_key: Optional[str] = None,
    ) -> Tuple[np.ndarray, str]:
        ...


class SegmentExtractor(Protocol):
    def extract(self, similarities: np.ndarray, timestamps: List[float]) -> List[Segment]:
        ...


class ClipSaver(Protocol):
    def save(self, video_path: str, segments: List[Segment], output_dir: str) -> List[str]:
        ...
