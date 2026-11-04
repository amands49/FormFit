import { useEffect, useRef, useState } from "react";
import { getPoseLandmarker, POSE_CONNECTIONS } from "../pose/landmarker";
import { createTracker } from "../pose/trackers";
import { RollingClipRecorder } from "../pose/clipRecorder";
import { FaultClipTracker } from "../pose/faultClipTracker";

const VISIBILITY_MIN = 0.15;

function LiveSession({ exercise, onEnd }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const trackerRef = useRef(createTracker(exercise.id));
  const clipRecorderRef = useRef(null);
  const faultClipTrackerRef = useRef(new FaultClipTracker());
  const capturedClipsRef = useRef({}); // { [faultTag]: objectUrl }
  const endingRef = useRef(false);

  const [phase, setPhase] = useState("starting"); // starting | running | error
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({
    reps: 0,
    stage: "Start",
    angle: 0,
    form_score: 100,
    feedback: "Good Form",
  });

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const [landmarker, stream] = await Promise.all([
          getPoseLandmarker(),
          navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
            audio: false,
          }),
        ]);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");

        // Clip capture is a bonus feature, not core to the session --
        // if the browser doesn't support captureStream/MediaRecorder, or
        // it throws for any reason, the live session keeps working with
        // no clips captured rather than failing to start at all.
        try {
          clipRecorderRef.current = new RollingClipRecorder(canvas);
        } catch (err) {
          console.warn("Clip recording unavailable this session:", err);
          clipRecorderRef.current = null;
        }

        setPhase("running");

        const loop = () => {
          if (cancelled) return;
          if (video.readyState >= 2) {
            const result = landmarker.detectForVideo(video, performance.now());
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const lm = result.landmarks?.[0];
            if (lm) {
              drawSkeleton(ctx, lm, canvas.width, canvas.height);
              const frame = trackerRef.current.processFrame(lm);
              setStats(frame);

              if (frame.new_fault && faultClipTrackerRef.current.shouldCapture(frame.new_fault)) {
                const url = clipRecorderRef.current?.getLatestClipUrl();
                if (url) capturedClipsRef.current[frame.new_fault] = url;
              }
            } else {
              setStats((prev) => ({ ...prev, feedback: "Not Visible" }));
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err.name === "NotAllowedError"
              ? "Camera access was denied. Allow camera access and try again."
              : "Couldn't start the camera or load the pose model."
          );
          setPhase("error");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clipRecorderRef.current?.stop();
    };
  }, []);

  function handleEnd() {
    if (endingRef.current) return;
    endingRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // Free every segment we recorded but never captured a fault against --
    // that's most of them, since a segment only survives if it happened to
    // be "latest" the instant a fault fired.
    clipRecorderRef.current?.revokeExcept(Object.values(capturedClipsRef.current));
    clipRecorderRef.current?.stop();
    onEnd(trackerRef.current.getSessionSummary(), capturedClipsRef.current);
  }

  const isWarning = stats.feedback.startsWith("WARNING") || stats.feedback === "Not Visible";

  return (
    <section aria-label={`Live ${exercise.name.toLowerCase()} session`}>
      <h1 className="page-title">{exercise.name} — live session</h1>

      {phase === "error" ? (
        <div className="session-error">
          <p>{errorMessage}</p>
          <button type="button" className="start-session-btn" onClick={onEnd}>
            Back to {exercise.name.toLowerCase()}
          </button>
        </div>
      ) : (
        <>
          <div className="session-stage">
            <div className="session-video">
              <video ref={videoRef} muted playsInline className="session-video__el" />
              <canvas ref={canvasRef} className="session-video__overlay" />
              {phase === "starting" && (
                <div className="session-video__loading">Starting camera…</div>
              )}
            </div>

            <div className="session-stats">
              <div className="session-stats__row">
                <span className="session-stats__label">Reps</span>
                <span className="session-stats__value">
                  {stats.reps} <small>({stats.stage})</small>
                </span>
              </div>
              <div className="session-stats__row">
                <span className="session-stats__label">{exercise.angleLabel}</span>
                <span className="session-stats__value">{stats.angle}°</span>
              </div>
              <div className="session-stats__row">
                <span className="session-stats__label">Form score</span>
                <span className="session-stats__value">{stats.form_score}</span>
              </div>
              <p className={`session-stats__feedback ${isWarning ? "session-stats__feedback--warning" : ""}`}>
                {stats.feedback}
              </p>
            </div>
          </div>

          <button type="button" className="end-session-btn" onClick={handleEnd}>
            End session
          </button>
        </>
      )}
    </section>
  );
}

function drawSkeleton(ctx, landmarks, width, height) {
  ctx.strokeStyle = "#2c5c86";
  ctx.lineWidth = 3;
  for (const [a, b] of POSE_CONNECTIONS) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    if (p1.visibility > VISIBILITY_MIN && p2.visibility > VISIBILITY_MIN) {
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }
  }
  ctx.fillStyle = "#c79a2e";
  for (const p of landmarks) {
    if (p.visibility > VISIBILITY_MIN) {
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default LiveSession;
