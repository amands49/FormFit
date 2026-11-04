from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):
    exercise: str
    reps: int
    form_score: float
    warnings: List[str] = []


class SessionOut(BaseModel):
    id: int
    exercise: str
    reps: int
    form_score: float
    warnings: str
    corrections: List[str] = []   # computed at read time, see main.py
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
