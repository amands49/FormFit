from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, SessionLocal, engine

Base.metadata.create_all(bind=engine)   # creates formfit.db + table on first run

app = FastAPI(title="FormFit AI API")

# Wide open for the hackathon demo. If you have time later, restrict
# allow_origins to your actual React dev URL (e.g. http://localhost:5173).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"FormFit AI is running...."}

@app.post("/sessions", response_model=schemas.SessionOut)
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    db_session = models.ExerciseSession(
        exercise=session.exercise,
        reps=session.reps,
        form_score=session.form_score,
        warnings=",".join(session.warnings),
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@app.get("/sessions", response_model=List[schemas.SessionOut])
def list_sessions(db: Session = Depends(get_db)):
    return (
        db.query(models.ExerciseSession)
        .order_by(models.ExerciseSession.created_at.desc())
        .all()
    )


@app.get("/sessions/{session_id}", response_model=schemas.SessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    db_session = (
        db.query(models.ExerciseSession)
        .filter(models.ExerciseSession.id == session_id)
        .first()
    )
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session
