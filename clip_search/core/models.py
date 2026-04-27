from dataclasses import dataclass


@dataclass
class Segment:
    start: float
    end: float
    max_score: float
    clip_path: str | None = None
