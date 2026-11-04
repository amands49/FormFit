# FormFit AI — Dashboard

React + Vite frontend for FormFit AI. See the [root README](../README.md) for the
overall architecture and fault rules.

## Run it

```bash
npm install
npm run dev
```

Start the backend first (default expected at `http://127.0.0.1:8000`):

```bash
cd ../formfit-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

If your backend runs elsewhere, copy `.env.example` to `.env` and set
`VITE_API_URL`.

Other scripts: `npm test` (Vitest), `npm run lint`, `npm run build`.

## How it's structured

- **Intro** — landing page; "Open the dashboard" enters the app.
- **Exercises** — a card per movement (Squat, Push-up, Lunge). The selected
  exercise is threaded through the whole flow.
- **Exercise detail** — demo figure, written form cues, **Start session**.
- **Live session** — camera + pose tracking run entirely in the browser via
  `@mediapipe/tasks-vision`, using the same `pose_landmarker_lite.task` model as
  the Python engine (in `public/models/`). `src/pose/trackers.js` maps the
  exercise id to its tracker (`squatTracker.js`, `pushupTracker.js`,
  `lungeTracker.js`), each a port of the matching class in
  `formfit-backend/Exercise_prg.py`. The first time each fault fires, a short
  clip of the canvas is kept (`clipRecorder.js`, experimental).
- **Session result** — score, reps, flagged faults, correction text, and a
  fault-vs-correct visual for each fault.
- **Progress** — score, trend chart, recurring faults with their corrections, and
  full history.
- **Credits** — team and stack.

## Why browser-based pose tracking

`Formfit_trial.py` opens a native OpenCV window, which can't be embedded in a web
page. Running detection client-side shows live webcam footage inside the app and
keeps video on the user's machine. The desktop script still works standalone and
posts to the same `/sessions` endpoint.

## Adding an exercise

1. Add a Python class in `formfit-backend/Exercise_prg.py` and its correction
   text in `formfit-backend/corrections.py`.
2. Port it to a JS tracker in `src/pose/`, register it in `trackers.js`, and add
   an entry in `src/exercises.js`.
3. Add tests for both sides; copy the depth-tracking tests as a starting point.
4. (Optional) add pose art in `components/PoseFigure.jsx` and
   `components/faultVisuals.js`; without it, the results screen shows text-only
   corrections for that exercise.
