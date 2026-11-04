import { describe, it, expect } from "vitest";
import { LungeTracker } from "./lungeTracker";

function landmarksForLunge(kneeTarget, backTarget = 90) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
  const kneePt = [0.5, 0.7];
  const r = 0.2;
  const hipPt = [kneePt[0] + r, kneePt[1]];
  const theta = (kneeTarget * Math.PI) / 180;
  const anklePt = [kneePt[0] + r * Math.cos(theta), kneePt[1] + r * Math.sin(theta)];

  const kneeDirFromHip = Math.atan2(kneePt[1] - hipPt[1], kneePt[0] - hipPt[0]);
  const shoulderDir = kneeDirFromHip + (backTarget * Math.PI) / 180;
  const r2 = 0.2;
  const shoulderPt = [hipPt[0] + r2 * Math.cos(shoulderDir), hipPt[1] + r2 * Math.sin(shoulderDir)];

  lm[23] = { x: hipPt[0], y: hipPt[1], visibility: 1 };
  lm[25] = { x: kneePt[0], y: kneePt[1], visibility: 1 };
  lm[27] = { x: anklePt[0], y: anklePt[1], visibility: 1 };
  lm[11] = { x: shoulderPt[0], y: shoulderPt[1], visibility: 1 };
  return lm;
}

describe("LungeTracker", () => {
  it("never flags a full-depth rep as shallow", () => {
    const t = new LungeTracker();
    t.stage = "UP";
    const seq = [170, 150, 120, 105, 90, 80, 90, 105, 120, 150, 170];
    for (const a of seq) t.processFrame(landmarksForLunge(a, 90));
    expect(t.warningLog.has("shallow_lunge")).toBe(false);
    expect(t.badReps).toBe(0);
  });

  it("flags a rep that never reaches depth", () => {
    const t = new LungeTracker();
    t.stage = "UP";
    const seq = [170, 140, 108, 102, 105, 140, 170];
    for (const a of seq) t.processFrame(landmarksForLunge(a, 90));
    expect(t.warningLog.has("shallow_lunge")).toBe(true);
    expect(t.badReps).toBe(1);
  });

  it("flags forward lean at the bottom of a full-depth rep", () => {
    const t = new LungeTracker();
    t.stage = "UP";
    const seq = [
      [170, 90], [140, 70], [105, 50], [80, 40], [90, 40],
      [105, 50], [140, 70], [170, 90],
    ];
    for (const [knee, back] of seq) t.processFrame(landmarksForLunge(knee, back));
    expect(t.warningLog.has("forward_lean")).toBe(true);
    expect(t.badReps).toBe(1);
  });
});

describe("LungeTracker new_fault reporting", () => {
  it("reports shallow_lunge on the exact frame the rep closes", () => {
    const t = new LungeTracker();
    t.stage = "UP";
    const seq = [170, 140, 108, 102, 105, 140, 170];
    let lastFrame = null;
    for (const a of seq) lastFrame = t.processFrame(landmarksForLunge(a, 90));
    expect(lastFrame.new_fault).toBe("shallow_lunge");
  });

  it("is null on every frame of a clean rep", () => {
    const t = new LungeTracker();
    t.stage = "UP";
    const seq = [170, 150, 120, 105, 90, 80, 90, 105, 120, 150, 170];
    for (const a of seq) {
      const frame = t.processFrame(landmarksForLunge(a, 90));
      expect(frame.new_fault).toBeNull();
    }
  });
});
