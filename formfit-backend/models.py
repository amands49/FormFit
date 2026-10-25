from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from database import Base


class ExerciseSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    exercise = Column(String, index=True)
    reps = Column(Integer)
    form_score = Column(Float)
    warnings = Column(String)   # stored as comma-separated tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())
