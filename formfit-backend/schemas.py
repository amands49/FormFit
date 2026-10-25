from datetime import datetime
from typing import List

from pydantic import BaseModel


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
    created_at: datetime

    class Config:
        from_attributes = True
