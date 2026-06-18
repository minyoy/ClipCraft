"""Compare CLIP frame search results across Korean, translated, and CLIP-friendly queries."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
import torch
from openai import OpenAI

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from services import ClipEmbedder, OpenAIQueryExpander, OpenCVFrameSampler  # noqa: E402


TRANSLATE_SYSTEM_PROMPT = (
    "Translate the Korean visual scene query into plain English.\n"
    "Return only JSON in this format: {\"query\": \"...\"}\n"
    "Keep the meaning literal. Do not optimize for CLIP. Do not add details."
)


@dataclass(frozen=True)
class QueryMode:
    key: str
    label: str
    query: str


@dataclass(frozen=True)
class FrameHit:
    frame_index: int
    timestamp: float
    score: float
    image_path: str


def translate_only(korean_query: str, model: str) -> str:
    client = OpenAI()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": TRANSLATE_SYSTEM_PROMPT},
            {"role": "user", "content": korean_query},
        ],
        max_tokens=80,
        temperature=0,
        response_format={"type": "json_object"},
    )
    raw_text = response.choices[0].message.content.strip()
    translated = OpenAIQueryExpander._parse_query(raw_text)
    return translated or korean_query


def build_query_modes(korean_query: str, openai_model: str) -> list[QueryMode]:
    translated_query = translate_only(korean_query, openai_model)
    clip_query = OpenAIQueryExpander(model=openai_model).expand(korean_query)
    return [
        QueryMode("ko_raw", "Korean raw", korean_query),
        QueryMode("translated", "Translated only", translated_query),
        QueryMode("clip_friendly", "Translated + CLIP-friendly", clip_query),
    ]


def encode_image_embeddings(
    frames: list[np.ndarray],
    embedder: ClipEmbedder,
    batch_size: int,
    cache_path: Path | None,
) -> torch.Tensor:
    if cache_path and cache_path.exists():
        cached = np.load(cache_path)
        if cached.shape[0] == len(frames):
            print(f"[cache] image embeddings -> {cache_path}")
            return torch.from_numpy(cached).to(embedder.device)

    batches: list[torch.Tensor] = []
    for start in range(0, len(frames), batch_size):
        batch = frames[start : start + batch_size]
        batches.append(embedder.encode_frame_batch(batch))

    embeddings = torch.cat(batches, dim=0)
    if cache_path:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        np.save(cache_path, embeddings.detach().cpu().numpy().astype(np.float32))
        print(f"[cache] saved image embeddings -> {cache_path}")
    return embeddings


def compute_scores(
    image_embeddings: torch.Tensor,
    embedder: ClipEmbedder,
    query: str,
) -> np.ndarray:
    query_embedding = embedder.encode_text([query]).squeeze(0)
    image_embeddings = image_embeddings.to(
        device=query_embedding.device,
        dtype=query_embedding.dtype,
    )
    return (image_embeddings @ query_embedding).detach().cpu().numpy().astype(np.float32)


def save_frame(path: Path, frame: np.ndarray, title: str) -> None:
    image = frame.copy()
    cv2.rectangle(image, (0, 0), (image.shape[1], 34), (0, 0, 0), thickness=-1)
    cv2.putText(
        image,
        title,
        (10, 23),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.62,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )
    cv2.imwrite(str(path), image)


def make_comparison_grid(
    mode_image_paths: dict[str, Path],
    output_path: Path,
) -> None:
    if not mode_image_paths:
        return

    mode_keys = list(mode_image_paths.keys())
    thumb_w = 320
    label_h = 34
    first_image = cv2.imread(str(mode_image_paths[mode_keys[0]]))
    if first_image is None:
        return
    source_h, source_w = first_image.shape[:2]
    thumb_h = max(1, round(thumb_w * source_h / source_w))
    cols = len(mode_keys)
    sheet = np.full((label_h + thumb_h, cols * thumb_w, 3), 245, dtype=np.uint8)

    for col, mode_key in enumerate(mode_keys):
        x = col * thumb_w
        cv2.rectangle(sheet, (x, 0), (x + thumb_w, label_h), (35, 35, 35), thickness=-1)
        cv2.putText(
            sheet,
            mode_key,
            (x + 10, 23),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.62,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    for col, mode_key in enumerate(mode_keys):
        image = cv2.imread(str(mode_image_paths[mode_key]))
        if image is None:
            continue
        thumb = cv2.resize(image, (thumb_w, thumb_h), interpolation=cv2.INTER_AREA)
        x = col * thumb_w
        sheet[label_h : label_h + thumb_h, x : x + thumb_w] = thumb

    cv2.imwrite(str(output_path), sheet)


def video_cache_key(video_path: Path, fps: float, clip_model: str) -> str:
    stat = video_path.stat()
    raw = "|".join(
        [
            str(video_path.resolve()),
            str(stat.st_size),
            str(stat.st_mtime_ns),
            f"{fps:.6f}",
            clip_model,
        ]
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def safe_name(text: str) -> str:
    safe = re.sub(r"[\\/:*?\"<>|]", "", text).strip().replace(" ", "_")[:50]
    return safe or "query"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compare top CLIP-matched frames for three query processing modes."
    )
    parser.add_argument("--video", required=True, help="Path to input video file")
    parser.add_argument("--query", required=True, help="Korean scene description")
    parser.add_argument("--output-dir", default="./query_compare/runs", help="Output directory")
    parser.add_argument("--fps", type=float, default=2.0, help="Frame sampling FPS")
    parser.add_argument("--batch-size", type=int, default=32, help="CLIP image batch size")
    parser.add_argument("--clip-model", default="ViT-L/14", help="CLIP model name")
    parser.add_argument("--openai-model", default="gpt-4o-mini", help="OpenAI query model")
    parser.add_argument("--no-cache", action="store_true", help="Disable image embedding cache")
    args = parser.parse_args()

    video_path = Path(args.video).expanduser().resolve()
    output_root = Path(args.output_dir).expanduser().resolve()
    run_dir = output_root / f"{video_path.stem}_{safe_name(args.query)}"
    frames_dir = run_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    modes = build_query_modes(args.query, args.openai_model)

    sampler = OpenCVFrameSampler()
    frames, timestamps = sampler.sample(str(video_path), fps=args.fps)
    if not frames:
        raise RuntimeError("No frames were sampled from the video.")

    embedder = ClipEmbedder(model_name=args.clip_model)
    cache_path = None
    if not args.no_cache:
        cache_key = video_cache_key(video_path, args.fps, args.clip_model)
        cache_path = run_dir / ".clip_cache" / f"{cache_key}.npy"
    image_embeddings = encode_image_embeddings(frames, embedder, args.batch_size, cache_path)

    mode_image_paths: dict[str, Path] = {}

    for mode in modes:
        scores = compute_scores(image_embeddings, embedder, mode.query)
        frame_idx = int(np.argmax(scores))
        timestamp = float(timestamps[frame_idx])
        score = float(scores[frame_idx])
        image_path = frames_dir / f"{mode.key}_top1_{timestamp:08.3f}s_score_{score:.4f}.jpg"
        title = f"{mode.key} top 1 | {timestamp:.3f}s | {score:.4f}"
        save_frame(image_path, frames[frame_idx], title)
        mode_image_paths[mode.key] = image_path

        hit = FrameHit(
            frame_index=frame_idx,
            timestamp=timestamp,
            score=score,
            image_path=str(image_path),
        )
        print(
            f"[{mode.key}] query='{mode.query}' "
            f"frame={hit.frame_index} time={hit.timestamp:.3f}s "
            f"score={hit.score:.4f} image={hit.image_path}"
        )

    comparison_grid = run_dir / "top1_comparison.jpg"
    make_comparison_grid(mode_image_paths, comparison_grid)

    print(f"[done] frames -> {frames_dir}")
    print(f"[done] comparison -> {comparison_grid}")


if __name__ == "__main__":
    main()
