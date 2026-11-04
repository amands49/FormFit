// Faithful JS port of formfit-backend/Exercise_metrics.py + Exercise_prg.py,
// so the browser session scores reps exactly the way the desktop CV engine does.
//
// Keep this file's CORRECTIONS map and SHALLOW_DEPTH_ANGLE in sync with the
// Python Squat class by hand -- see the note in formfit-backend/corrections.py.

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const VISIBILITY_MIN = 0.15;
const SHALLOW_DEPTH_ANGLE = 90;

const CORRECTIONS = {
  forward_lean: "Keep your chest up and sit back into your hips.",
  shallow_squat: "Lower your hips further — aim for thighs parallel to the floor.",
};
const DEFAULT_CORRECTION = "Adjust your form and try again.";

export class SquatTracker {
  name = "Squat";
  rep = 0;
  stage = "Start";
  feedback = "Good Form";
  badReps = 0;
  repFlagged = false;
  warningLog = new Set();
  repMinKneeAngle = null; // deepest point reached in the current rep

  getCorrection(tag) {
    return CORRECTIONS[tag] ?? DEFAULT_CORRECTION;
  }

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
    let shallowFlaggedThisFrame = false;
    let newFault = null;

    if (visible) {
      kneeAngle = calculateAngle(hip, knee, ankle);
      const backAngle = calculateAngle(shoulder, hip, knee);

      // Track depth across the whole DOWN phase instead of judging off a
      // single frame's angle -- a per-frame check fires on good reps too,
      // since even a full-depth rep passes through the 80-100 band on the
      // way down AND on the way back up.
      if (this.stage === "DOWN") {
        if (this.repMinKneeAngle === null || kneeAngle < this.repMinKneeAngle) {
          this.repMinKneeAngle = kneeAngle;
        }
      }

      if (kneeAngle > 160) {
        if (this.stage === "DOWN") {
          if (this.repMinKneeAngle !== null && this.repMinKneeAngle > SHALLOW_DEPTH_ANGLE) {
            this.flagCurrentRep("shallow_squat");
            shallowFlaggedThisFrame = true;
          }
          this.closeRep();
        }
        this.stage = "UP";
      } else if (kneeAngle < 100 && this.stage === "UP") {
        this.stage = "DOWN";
        this.rep += 1;
        this.repFlagged = false;
        this.repMinKneeAngle = null;
      }

      if (this.stage === "DOWN" && backAngle < 50) {
        this.feedback = `WARNING: ${this.getCorrection("forward_lean")}`;
        this.flagCurrentRep("forward_lean");
        newFault = "forward_lean";
      } else if (shallowFlaggedThisFrame) {
        this.feedback = `WARNING: ${this.getCorrection("shallow_squat")}`;
        newFault = "shallow_squat";
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
      new_fault: newFault,
    };
  }

  getSessionSummary() {
    // Tags only, same reasoning as the Python side: correction TEXT is
    // computed at read time by the backend, not duplicated into what
    // gets sent over the wire.
    return {
      exercise: this.name,
      reps: this.rep,
      form_score: this.getFormScore(),
      warnings: [...this.warningLog],
    };
  }
}
