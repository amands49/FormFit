import { describe, it, expect } from "vitest";
import { SquatTracker } from "./squatTracker";

/**
 * Builds a landmark array where hip/knee/ankle produce EXACTLY the
 * requested knee angle (same geometry as the Python test helper --
 * verified against calculateAngle, not assumed), with the shoulder
 * placed directly above the hip so back angle stays a constant 90,
 * isolating depth behavior from the forward-lean check.
 */
function landmarksForKneeAngle(kneeAngleTarget) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
  const kneePt = [0.5, 0.7];
  const r = 0.2;
  const hipPt = [kneePt[0] + r, kneePt[1]];
  const theta = (kneeAngleTarget * Math.PI) / 180;
  const anklePt = [kneePt[0] + r * Math.cos(theta), kneePt[1] + r * Math.sin(theta)];

  lm[23] = { x: hipPt[0], y: hipPt[1], visibility: 1 };
  lm[25] = { x: kneePt[0], y: kneePt[1], visibility: 1 };
  lm[27] = { x: anklePt[0], y: anklePt[1], visibility: 1 };
  lm[11] = { x: hipPt[0], y: hipPt[1] - 0.3, visibility: 1 };
  return lm;
}

describe("SquatTracker corrections", () => {
  it("returns the specific cue for a known fault", () => {
    const tracker = new SquatTracker();
    expect(tracker.getCorrection("forward_lean")).toBe(
      "Keep your chest up and sit back into your hips."
    );
    expect(tracker.getCorrection("shallow_squat")).toBe(
      "Lower your hips further — aim for thighs parallel to the floor."
    );
  });

  it("falls back to a default cue for an unmapped fault", () => {
    const tracker = new SquatTracker();
    expect(tracker.getCorrection("some_future_fault")).toBe(
      "Adjust your form and try again."
    );
  });
});

describe("SquatTracker shallow-squat depth tracking", () => {
  it("never flags a rep that actually reaches full depth (regression case)", () => {
    const tracker = new SquatTracker();
    tracker.stage = "UP";
    const sequence = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170];
    for (const angle of sequence) {
      tracker.processFrame(landmarksForKneeAngle(angle));
    }
    expect(tracker.warningLog.has("shallow_squat")).toBe(false);
    expect(tracker.badReps).toBe(0);
  });

  it("flags a rep that never reaches depth", () => {
    const tracker = new SquatTracker();
    tracker.stage = "UP";
    const sequence = [170, 140, 99, 96, 98, 140, 170];
    for (const angle of sequence) {
      tracker.processFrame(landmarksForKneeAngle(angle));
    }
    expect(tracker.warningLog.has("shallow_squat")).toBe(true);
    expect(tracker.badReps).toBe(1);
  });
});

describe("SquatTracker scoring", () => {
  it("lowers form score for bad reps", () => {
    const tracker = new SquatTracker();
    tracker.rep = 4;
    tracker.badReps = 1;
    expect(tracker.getFormScore()).toBe(75);
  });

  it("session summary carries tags only, no correction text", () => {
    const tracker = new SquatTracker();
    tracker.rep = 3;
    tracker.flagCurrentRep("forward_lean");
    const summary = tracker.getSessionSummary();
    expect(summary.warnings).toEqual(["forward_lean"]);
    expect(summary.corrections).toBeUndefined();
  });
});

describe("SquatTracker new_fault reporting", () => {
  it("reports shallow_squat on the exact frame the rep closes", () => {
    const tracker = new SquatTracker();
    tracker.stage = "UP";
    const sequence = [170, 140, 95, 97, 93, 140, 170];
    let lastFrame = null;
    for (const angle of sequence) {
      lastFrame = tracker.processFrame(landmarksForKneeAngle(angle));
    }
    // the final frame (170, closing the rep) is where the shallow verdict fires
    expect(lastFrame.new_fault).toBe("shallow_squat");
  });

  it("is null on every frame of a clean rep", () => {
    const tracker = new SquatTracker();
    tracker.stage = "UP";
    const sequence = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170];
    for (const angle of sequence) {
      const frame = tracker.processFrame(landmarksForKneeAngle(angle));
      expect(frame.new_fault).toBeNull();
    }
  });
});
