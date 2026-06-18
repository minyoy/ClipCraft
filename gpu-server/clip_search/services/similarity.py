import os
from typing import List, Tuple

import numpy as np
import torch

from core.protocols import QueryExpander, VisionTextEmbedder


class SimilarityAnalyzer:
    def __init__(
        self,
        query_expander: QueryExpander,
        embedder: VisionTextEmbedder,
        batch_size: int = 32,
        cache_dir: str = ".clip_cache",
    ) -> None:
        self._query_expander = query_expander
        self._embedder = embedder
        self._batch_size = batch_size
        self._cache_dir = cache_dir

    def compute_similarity_curve(
        self,
        frames: List[np.ndarray],
        korean_query: str,
        cache_key: str | None = None,
    ) -> Tuple[np.ndarray, str]:
        english_query = self._query_expander.expand(korean_query)
        query_embedding = self._embedder.encode_text([english_query]).squeeze(0)

        if not frames:
            return np.array([], dtype=np.float32), english_query

        image_embeddings = self._load_or_encode_image_embeddings(frames, cache_key)
        image_embeddings = image_embeddings.to(
            device=query_embedding.device,
            dtype=query_embedding.dtype,
        )
        all_sims: List[np.ndarray] = []
        for start in range(0, len(frames), self._batch_size):
            image_batch_embeddings = image_embeddings[start : start + self._batch_size]
            sims = (image_batch_embeddings @ query_embedding).cpu().numpy()
            all_sims.append(sims)

        return np.concatenate(all_sims).astype(np.float32), english_query

    def _load_or_encode_image_embeddings(
        self,
        frames: List[np.ndarray],
        cache_key: str | None,
    ) -> torch.Tensor:
        cache_path = self._cache_path(cache_key) if cache_key else None
        if cache_path and os.path.exists(cache_path):
            cached = np.load(cache_path)
            if cached.shape[0] == len(frames):
                device = getattr(self._embedder, "device", "cpu")
                print(f"[cache] image embeddings -> {cache_path}")
                return torch.from_numpy(cached).to(device)

        batches: List[torch.Tensor] = []
        for start in range(0, len(frames), self._batch_size):
            batch = frames[start : start + self._batch_size]
            batches.append(self._embedder.encode_frame_batch(batch))

        image_embeddings = torch.cat(batches, dim=0)

        if cache_path:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            np.save(cache_path, image_embeddings.detach().cpu().numpy().astype(np.float32))
            print(f"[cache] saved image embeddings -> {cache_path}")

        return image_embeddings

    def _cache_path(self, cache_key: str | None) -> str | None:
        if not cache_key:
            return None
        return os.path.join(self._cache_dir, f"{cache_key}.npy")
