// Faithful JS port of formfit-backend/Exercise_prg.py:Pushup.
// Keep CORRECTIONS and thresholds in sync with the Python class by hand.

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const VISIBILITY_MIN = 0.15;
// Elbow must dip at/below this to count as full depth. The DOWN-phase
// entry gate below is intentionally looser than this -- same relationship
// as Squat's knee thresholds.
const SHALLOW_ELBOW_ANGLE = 90;

const CORRECTIONS = {
  hip_sag: "Brace your core and keep hips, shoulders, and ankles in one line.",
  shallow_pushup: "Lower your chest closer to the floor before pressing back up.",
};
const DEFAULT_CORRECTION = "Adjust your form and try again.";

export class PushupTracker {
  name = "Push-up";
  rep = 0;
  stage = "Start";
  feedback = "Good Form";
  badReps = 0;
  repFlagged = false;
  warningLog = new Set();
  repMinElbowAngle = null;

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

  processFrame(landmarks) {
    const shoulder = [landmarks[11].x, landmarks[11].y];
    const elbow = [landmarks[13].x, landmarks[13].y];
    const wrist = [landmarks[15].x, landmarks[15].y];
    const hip = [landmarks[23].x, landmarks[23].y];
    const ankle = [landmarks[27].x, landmarks[27].y];

    const visible = [
      landmarks[13].visibility,
      landmarks[11].visibility,
      landmarks[15].visibility,
      landmarks[23].visibility,
      landmarks[27].visibility,
    ].every((v) => v > VISIBILITY_MIN);

    let elbowAngle = 0;
    let shallowFlaggedThisFrame = false;
    let newFault = null;

    if (visible) {
      elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const bodyLineAngle = calculateAngle(shoulder, hip, ankle);

      if (this.stage === "DOWN") {
        if (this.repMinElbowAngle === null || elbowAngle < this.repMinElbowAngle) {
          this.repMinElbowAngle = elbowAngle;
        }
      }

      if (elbowAngle > 160) {
        if (this.stage === "DOWN") {
          if (this.repMinElbowAngle !== null && this.repMinElbowAngle > SHALLOW_ELBOW_ANGLE) {
            this.flagCurrentRep("shallow_pushup");
            shallowFlaggedThisFrame = true;
          }
          this.closeRep();
        }
        this.stage = "UP";
      } else if (elbowAngle < 100 && this.stage === "UP") {
        this.stage = "DOWN";
        this.rep += 1;
        this.repFlagged = false;
        this.repMinElbowAngle = null;
      }

      if (bodyLineAngle < 160) {
        this.feedback = `WARNING: ${this.getCorrection("hip_sag")}`;
        this.flagCurrentRep("hip_sag");
        newFault = "hip_sag";
      } else if (shallowFlaggedThisFrame) {
        this.feedback = `WARNING: ${this.getCorrection("shallow_pushup")}`;
        newFault = "shallow_pushup";
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
      angle: Math.round(elbowAngle),
      form_score: this.getFormScore(),
      new_fault: newFault,
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
