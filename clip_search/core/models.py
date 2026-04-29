from dataclasses import dataclass
from typing import Optional


@dataclass
class Segment:
    start: float
    end: float
    max_score: float
    clip_path: Optional[str] = None
