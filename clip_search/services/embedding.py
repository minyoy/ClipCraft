from typing import Sequence

import clip
import cv2
import numpy as np
import torch
from PIL import Image


class ClipEmbedder:
    def __init__(self, model_name: str = "ViT-L/14", device: str | None = None) -> None:
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[init] device: {self.device}")
        print(f"[init] loading CLIP model ({model_name}) ...")
        self._model, self._preprocess = clip.load(model_name, device=self.device)
        self._model.eval()
        print("[init] CLIP model ready.\n")

    def encode_text(self, queries: Sequence[str]) -> torch.Tensor:
        tokens = clip.tokenize(list(queries), truncate=True).to(self.device)
        with torch.no_grad():
            embeddings = self._model.encode_text(tokens)
        return embeddings / embeddings.norm(dim=-1, keepdim=True)

    def encode_frame_batch(self, frames: Sequence[np.ndarray]) -> torch.Tensor:
        tensors = torch.stack(
            [
                self._preprocess(Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)))
                for bgr in frames
            ]
        ).to(self.device)

        with torch.no_grad():
            embeddings = self._model.encode_image(tensors)

        return embeddings / embeddings.norm(dim=-1, keepdim=True)
