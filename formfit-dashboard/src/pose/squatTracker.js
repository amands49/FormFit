// Faithful JS port of formfit-backend/Exercise_metrics.py + Exercise_prg.py,
// so the browser session scores reps exactly the way the desktop CV engine does.

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const VISIBILITY_MIN = 0.15;

export class SquatTracker {
  name = "Squat";
  rep = 0;
  stage = "Start";
  feedback = "Good Form";
  badReps = 0;
  repFlagged = false;
  warningLog = new Set();

  flagCurrentRep(tag) {
    this.repFlagged = true;
    this.warningLog.add(tag);
  }

  closeRep() {
    if (this.repFlagged) this.badReps += 1;
    this.repFlagged = false;
  }

  getFormScore() {
    if (this.rep === 0) return 100;
    const goodReps = this.rep - this.badReps;
    return Math.round((goodReps / this.rep) * 1000) / 10;
  }

  /** landmarks: array of {x,y,z,visibility} from MediaPipe PoseLandmarker, normalized image landmarks. */
  processFrame(landmarks) {
    const hip = [landmarks[23].x, landmarks[23].y];
    const knee = [landmarks[25].x, landmarks[25].y];
    const ankle = [landmarks[27].x, landmarks[27].y];
    const shoulder = [landmarks[11].x, landmarks[11].y];

    const visible = [
      landmarks[25].visibility,
      landmarks[23].visibility,
      landmarks[27].visibility,
      landmarks[11].visibility,
    ].every((v) => v > VISIBILITY_MIN);

    let kneeAngle = 0;
    if (visible) {
      kneeAngle = calculateAngle(hip, knee, ankle);
      const backAngle = calculateAngle(shoulder, hip, knee);

      if (kneeAngle > 160) {
        if (this.stage === "DOWN") this.closeRep();
        this.stage = "UP";
      } else if (kneeAngle < 100 && this.stage === "UP") {
        this.stage = "DOWN";
        this.rep += 1;
        this.repFlagged = false;
      }

      if (this.stage === "DOWN" && backAngle < 50) {
        this.feedback = "WARNING: Keep chest up — leaning too forward";
        this.flagCurrentRep("forward_lean");
      } else {
        this.feedback = "Form looks solid!";
      }
    } else {
      this.feedback = "Not Visible";
    }

    return {
      reps: this.rep,
      stage: this.stage,
      feedback: this.feedback,
      angle: Math.round(kneeAngle),
      form_score: this.getFormScore(),
    };
  }

  getSessionSummary() {
    return {
      exercise: this.name,
      reps: this.rep,
      form_score: this.getFormScore(),
      warnings: [...this.warningLog],
    };
  }
}
