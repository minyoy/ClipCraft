from typing import List, Tuple

import cv2
import numpy as np


class OpenCVFrameSampler:
    def sample(self, video_path: str, fps: float = 1.0) -> Tuple[List[np.ndarray], List[float]]:
        if fps <= 0:
            raise ValueError("fps must be greater than 0.")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        native_fps = float(cap.get(cv2.CAP_PROP_FPS))
        if native_fps <= 0:
            native_fps = 30.0

        frame_interval = max(1, int(round(native_fps / fps)))

        frames: List[np.ndarray] = []
        timestamps: List[float] = []

        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if frame_idx % frame_interval == 0:
                frames.append(frame)
                timestamps.append(frame_idx / native_fps)
            frame_idx += 1

        cap.release()
        print(f"[frames] extracted {len(frames)} frames at {fps} fps from '{video_path}'")
        return frames, timestamps
