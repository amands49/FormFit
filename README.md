# FormFit AI

Real-time exercise form coaching in the browser. Point a webcam at yourself, do a
set, and FormFit counts reps, flags form faults as they happen, tells you what to
change, and logs every session so you can see trends over time.

Supported exercises: **Squat**, **Push-up**, **Lunge**.

Built by Team GIT FIT for MIRAETHON 2K26.

<!-- Add a screenshot or short GIF of a live session + the results screen here. -->

## What it does

1. Pick an exercise and start a live session. Pose detection runs **in your
   browser** (MediaPipe Pose Landmarker, WASM). No video leaves your machine.
2. Joint angles are computed every frame and fed to a per-exercise rep state
   machine that counts reps and checks form.
3. When form breaks, the warning includes the correction, not just the fault
   ("Keep your chest up and sit back into your hips").
4. When you end the session, the results screen shows your score, the faults
   that fired, a stick-figure comparison of what happened vs. correct form, and
   a short clip of your camera footage for each captured fault. Clips do not
   include the live skeleton overlay and stay in the browser; they are not
   uploaded.
5. Sessions are saved through a FastAPI backend; the Progress view shows score
   trend, recurring faults, and history.

## Architecture

```
Browser (React + Vite)
 |- webcam -> MediaPipe Pose Landmarker (WASM, client-side)
 |- trackers (Squat / Push-up / Lunge): landmarks -> angles -> rep state machine -> fault flags
 |- live skeleton overlay + stats; one camera-footage clip captured per distinct fault (MediaRecorder)
 '- results screen + progress dashboard
        |
        |  POST /sessions  { exercise, reps, form_score, warnings: [fault tags] }
        v
FastAPI + SQLAlchemy + SQLite
 '- GET /sessions -> rows + `corrections` computed from the stored fault tags

Desktop CV engine (Python + OpenCV): same rules, posts to the same endpoint.
```

## Fault rules

All angles are 2D, computed from MediaPipe landmarks on the **left side** of the
body. A rep enters DOWN when the tracked joint bends past the entry angle and
completes when it re-extends past 160 degrees.

| Exercise | Fault | Rule |
|---|---|---|
| Squat | `forward_lean` | shoulder-hip-knee angle < 50 while in DOWN |
| Squat | `shallow_squat` | deepest knee angle in the rep never got to 90 or below (DOWN entry: knee < 100) |
| Push-up | `hip_sag` | shoulder-hip-ankle angle < 160 at any point in the rep |
| Push-up | `shallow_pushup` | deepest elbow angle in the rep never got to 90 or below (DOWN entry: elbow < 100) |
| Lunge | `forward_lean` | shoulder-hip-knee angle < 55 while in DOWN |
| Lunge | `shallow_lunge` | deepest front-knee angle in the rep never got to 100 or below (DOWN entry: knee < 110) |

These are starting thresholds. They have not been tuned against real footage of
different bodies and camera angles.

## Design decisions worth knowing about

- **Inference runs client-side.** Nothing needs to stream to a server, which keeps
  latency down and keeps video private. The cost: the rep/fault logic exists twice
  (Python desktop engine and the JS trackers), kept in sync by hand and covered by
  tests on both sides.
- **Depth is judged per rep, not per frame.** An early version flagged
  `shallow_squat` whenever the knee angle sat in a "shallow" band on any single
  frame, which also fired on good reps as they passed through that band on the way
  down and up. Trackers now record the deepest angle across the whole rep and
  judge it once, when the rep closes. Regression tests cover a full-depth rep that
  must never be flagged.
- **The database stores fault tags, not advice text.** Correction text is computed
  at read time (`formfit-backend/corrections.py`), so rewording a cue updates every
  past session without a migration.
- **No ML model, on purpose.** An LSTM was considered and scoped out: the labeled
  data available wasn't enough to justify it, and rule-based angle checks are
  explainable and testable.

## Running it

Backend:

```bash
cd formfit-backend
pip install -r requirements.txt
uvicorn main:app --reload      # http://127.0.0.1:8000  (docs at /docs)
```

Dashboard:

```bash
cd formfit-dashboard
npm install
npm run dev
```

Desktop script (optional, needs a webcam):

```bash
cd formfit-backend
pip install -r requirements-cv.txt
python Formfit_trial.py        # q to quit and post the session; y/n toggles the skeleton overlay
```

## Tests

```bash
cd formfit-backend && pip install -r requirements-dev.txt && pytest
cd formfit-dashboard && npm install && npm test
```

Tests drive the trackers with synthetic landmark sequences constructed to produce
exact joint angles, and exercise the API against an in-memory database. They do
not cover the camera, MediaPipe itself, or the MediaRecorder clip path.

## Project layout

```
formfit-backend/     FastAPI app, SQLAlchemy models, Python CV engine, tests
  Exercise_metrics.py   shared Exercise base class (angles, scoring, corrections lookup)
  Exercise_prg.py       Squat, Pushup, Lunge
  corrections.py        fault tag -> correction text (read-time)
formfit-dashboard/   React + Vite app
  src/pose/             MediaPipe loader, JS trackers, clip recorder, tests
  src/components/       live session, results, progress, pose figures
```

## Known limitations

- No accounts: all sessions share one history.
- SQLite, open CORS: fine for a demo, not for real concurrent users.
- 2D angles from one side of the body. No knee-valgus or other frontal-plane
  checks; the camera needs a clear view of your left side.
- Fault clips use MediaRecorder on the camera stream: they live in browser
  memory only (no upload, gone on refresh), and Safari is not verified. Clips
  do not include the live skeleton overlay.
- The "what happened vs. aim for this" visuals are illustrated stick figures. Real
  reference photos or clips can be dropped into
  `formfit-dashboard/src/pose/referenceMedia.js` and are picked up automatically.
