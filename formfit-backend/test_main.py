"""
test_main.py
-------------
Run with: pytest test_main.py

Each test gets its own in-memory SQLite database, so no test reads or writes
sessions in your real formfit.db. (Importing main still runs create_all against
the real engine, which only creates empty tables if they're missing.)
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
from database import Base


@pytest.fixture
def client():
    # StaticPool matters: without it, every new connection to
    # sqlite:///:memory: gets its own separate, empty database.
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[main.get_db] = override_get_db
    yield TestClient(main.app)
    main.app.dependency_overrides.clear()


def test_forward_lean_correction(client):
    resp = client.post("/sessions", json={
        "exercise": "Squat", "reps": 10, "form_score": 70.0,
        "warnings": ["forward_lean"],
    })
    assert resp.json()["corrections"] == [
        "Keep your chest up and sit back into your hips."
    ]


def test_shallow_squat_correction(client):
    resp = client.post("/sessions", json={
        "exercise": "Squat", "reps": 8, "form_score": 60.0,
        "warnings": ["shallow_squat"],
    })
    assert resp.json()["corrections"] == [
        "Lower your hips further — aim for thighs parallel to the floor."
    ]


def test_both_faults_in_one_session(client):
    resp = client.post("/sessions", json={
        "exercise": "Squat", "reps": 10, "form_score": 50.0,
        "warnings": ["forward_lean", "shallow_squat"],
    })
    assert resp.json()["corrections"] == [
        "Keep your chest up and sit back into your hips.",
        "Lower your hips further — aim for thighs parallel to the floor.",
    ]


def test_get_sessions_list_also_includes_corrections(client):
    client.post("/sessions", json={
        "exercise": "Squat", "reps": 10, "form_score": 70.0,
        "warnings": ["forward_lean"],
    })
    sessions = client.get("/sessions").json()
    assert sessions[0]["corrections"] == [
        "Keep your chest up and sit back into your hips."
    ]


def test_unmapped_fault_tag_gets_default_correction(client):
    resp = client.post("/sessions", json={
        "exercise": "Squat", "reps": 5, "form_score": 90.0,
        "warnings": ["some_future_fault"],
    })
    assert resp.json()["corrections"] == ["Adjust your form and try again."]


def test_clean_session_has_no_corrections(client):
    resp = client.post("/sessions", json={
        "exercise": "Squat", "reps": 8, "form_score": 100.0, "warnings": [],
    })
    assert resp.json()["corrections"] == []


def test_pushup_correction(client):
    resp = client.post("/sessions", json={
        "exercise": "Push-up", "reps": 12, "form_score": 65.0,
        "warnings": ["hip_sag"],
    })
    assert resp.json()["corrections"] == [
        "Brace your core and keep hips, shoulders, and ankles in one line."
    ]


def test_lunge_correction(client):
    resp = client.post("/sessions", json={
        "exercise": "Lunge", "reps": 10, "form_score": 70.0,
        "warnings": ["shallow_lunge"],
    })
    assert resp.json()["corrections"] == [
        "Bend the front knee further, until your thigh is closer to parallel with the floor."
    ]
