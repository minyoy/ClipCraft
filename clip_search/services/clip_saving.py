import os
from typing import List

import cv2

from clip_search.core.models import Segment


class OpenCVClipSaver:
    def save(self, video_path: str, segments: List[Segment], output_dir: str = ".") -> List[str]:
        os.makedirs(output_dir, exist_ok=True)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        native_fps = float(cap.get(cv2.CAP_PROP_FPS))
        if native_fps <= 0:
            native_fps = 30.0

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        base = os.path.splitext(os.path.basename(video_path))[0]
        saved_paths: List[str] = []

        for idx, segment in enumerate(segments, start=1):
            start_frame = max(0, int(segment.start * native_fps))
            end_frame = max(start_frame, int(segment.end * native_fps))

            out_path = os.path.join(output_dir, f"{base}_clip{idx:02d}.mp4")
            writer = cv2.VideoWriter(
                out_path,
                cv2.VideoWriter_fourcc(*"mp4v"),
                native_fps,
                (width, height),
            )

            cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
            for _ in range(end_frame - start_frame + 1):
                ret, frame = cap.read()
                if not ret:
                    break
                writer.write(frame)

            writer.release()
            saved_paths.append(out_path)
            print(f"[save] clip {idx} -> {out_path}")

        cap.release()
        return saved_paths
