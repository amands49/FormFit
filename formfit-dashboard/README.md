# FormFit AI — Dashboard

React frontend for FormFit AI: an intro page, a sidebar app shell, an
exercise browser, live in-browser webcam sessions, and a progress dashboard
— all backed by the FastAPI service in `formfit-backend/`.

## Run it

```bash
npm install
npm run dev
```

Start the backend first (default expected at `http://127.0.0.1:8000`):

```bash
cd formfit-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

If your backend runs elsewhere, copy `.env.example` to `.env` and set
`VITE_API_URL`.

## How it's structured

- **Intro** — landing page, "Open the dashboard" to enter the app.
- **Sidebar** — Exercises / Progress / Credits, plus a live form-score badge.
- **Exercises** — a card per movement. Only Squat is wired up (that's all
  the backend's `Exercise_prg.py` implements today); more cards show as
  "coming soon" placeholders so the UI doesn't promise scoring the backend
  can't do yet.
- **Exercise detail** — an animated demo pictogram, written form cues, and
  **Start session**.
- **Live session** — camera access + pose tracking, run entirely in the
  browser via `@mediapipe/tasks-vision` and the same
  `pose_landmarker_lite.task` model your Python engine uses (copied into
  `public/models/`). `src/pose/squatTracker.js` is a line-for-line JS port
  of `Exercise_metrics.py` + `Exercise_prg.py`, so rep counting and the
  forward-lean fault check score identically to the desktop version.
  **End session** stops the camera and POSTs the summary to `/sessions`.
- **Session result** — score, reps, and flagged faults for the set just
  finished, with a retry if the save fails.
- **Progress** — score, a form-quality progress bar, the score trend chart,
  recurring-fault breakdown, and full session history.
- **Credits** — team and stack, pulled from the project explainer.

## Why browser-based pose tracking

`Formfit_trial.py` opens a native OpenCV window (`cv2.imshow`), which can't
be embedded in a web page. To actually show live webcam footage *inside*
the app, the live session runs pose detection client-side instead of
shelling out to the Python script — same model file, same scoring logic,
just running in WASM in the tab. The desktop script still works standalone
and posts to the same `/sessions` endpoint if you'd rather run it that way.
