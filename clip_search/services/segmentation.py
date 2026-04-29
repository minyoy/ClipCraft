from typing import List

import numpy as np
from scipy.ndimage import uniform_filter1d

from core.models import Segment


class SegmentDetector:
    def __init__(
        self,
        smooth_window: int = 5,
        min_duration: float = 2.0,
        top_k: int = 3,
        merge_gap: float = 2.0,
        peak_percentile: float = 85.0,
        expand_seconds: float = 3.0,
    ) -> None:
        self._smooth_window = max(1, smooth_window)
        self._min_duration = min_duration
        self._top_k = top_k
        self._merge_gap = merge_gap
        self._peak_percentile = peak_percentile
        self._expand_seconds = expand_seconds

    def extract(self, similarities: np.ndarray, timestamps: List[float]) -> List[Segment]:
        if len(similarities) == 0:
            return []

        if len(similarities) != len(timestamps):
            raise ValueError("similarities and timestamps must have the same length.")

        smoothed = uniform_filter1d(similarities.astype(np.float64), size=self._smooth_window)
        peak_threshold = float(np.percentile(smoothed, self._peak_percentile))
        ts = np.asarray(timestamps)
        video_end = float(ts[-1])

        peak_indices = self._find_peak_indices(smoothed, peak_threshold)
        if not peak_indices:
            peak_indices = [int(np.argmax(smoothed))]

        raw = [
            Segment(
                start=max(0.0, float(ts[idx]) - self._expand_seconds),
                end=min(video_end, float(ts[idx]) + self._expand_seconds),
                max_score=float(smoothed[idx]),
            )
            for idx in peak_indices
        ]
        raw = sorted(raw, key=lambda segment: segment.start)
        filtered = [segment for segment in raw if segment.end - segment.start >= self._min_duration]
        if not filtered:
            return []

        merged: List[Segment] = [filtered[0]]
        for segment in filtered[1:]:
            prev = merged[-1]
            if segment.start - prev.end <= self._merge_gap:
                prev.end = max(prev.end, segment.end)
                prev.max_score = max(prev.max_score, segment.max_score)
            else:
                merged.append(segment)

        top = sorted(merged, key=lambda segment: segment.max_score, reverse=True)[: self._top_k]
        return sorted(top, key=lambda segment: segment.start)

    @staticmethod
    def _find_peak_indices(smoothed: np.ndarray, threshold: float) -> List[int]:
        if len(smoothed) == 1:
            return [0] if smoothed[0] >= threshold else []

        peaks: List[int] = []
        for idx, value in enumerate(smoothed):
            left = smoothed[idx - 1] if idx > 0 else float("-inf")
            right = smoothed[idx + 1] if idx < len(smoothed) - 1 else float("-inf")
            if value >= threshold and value >= left and value >= right:
                peaks.append(idx)

        return peaks
