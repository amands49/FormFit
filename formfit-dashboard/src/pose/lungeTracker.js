// Faithful JS port of formfit-backend/Exercise_prg.py:Lunge.
// Keep CORRECTIONS and thresholds in sync with the Python class by hand.

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const VISIBILITY_MIN = 0.15;
const SHALLOW_DEPTH_ANGLE = 100;

const CORRECTIONS = {
  forward_lean: "Keep your torso upright — don't tip forward over your front knee.",
  shallow_lunge: "Bend the front knee further, until your thigh is closer to parallel with the floor.",
};
const DEFAULT_CORRECTION = "Adjust your form and try again.";

export class LungeTracker {
  name = "Lunge";
  rep = 0;
  stage = "Start";
  feedback = "Good Form";
  badReps = 0;
  repFlagged = false;
  warningLog = new Set();
  repMinKneeAngle = null;

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

  /** Front leg: hip=23, knee=25, ankle=27, shoulder=11 (same landmarks as Squat). */
  processFrame(landmarks) {
    const shoulder = [landmarks[11].x, landmarks[11].y];
    const hip = [landmarks[23].x, landmarks[23].y];
    const knee = [landmarks[25].x, landmarks[25].y];
    const ankle = [landmarks[27].x, landmarks[27].y];

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

      if (this.stage === "DOWN") {
        if (this.repMinKneeAngle === null || kneeAngle < this.repMinKneeAngle) {
          this.repMinKneeAngle = kneeAngle;
        }
      }

      if (kneeAngle > 160) {
        if (this.stage === "DOWN") {
          if (this.repMinKneeAngle !== null && this.repMinKneeAngle > SHALLOW_DEPTH_ANGLE) {
            this.flagCurrentRep("shallow_lunge");
            shallowFlaggedThisFrame = true;
          }
          this.closeRep();
        }
        this.stage = "UP";
      } else if (kneeAngle < 110 && this.stage === "UP") {
        this.stage = "DOWN";
        this.rep += 1;
        this.repFlagged = false;
        this.repMinKneeAngle = null;
      }

      if (this.stage === "DOWN" && backAngle < 55) {
        this.feedback = `WARNING: ${this.getCorrection("forward_lean")}`;
        this.flagCurrentRep("forward_lean");
        newFault = "forward_lean";
      } else if (shallowFlaggedThisFrame) {
        this.feedback = `WARNING: ${this.getCorrection("shallow_lunge")}`;
        newFault = "shallow_lunge";
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
    return {
      exercise: this.name,
      reps: this.rep,
      form_score: this.getFormScore(),
      warnings: [...this.warningLog],
    };
  }
}
