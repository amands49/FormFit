import { describe, it, expect } from "vitest";
import { PushupTracker } from "./pushupTracker";

function landmarksForPushup(elbowTarget, bodyLineTarget = 180) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
  const elbowPt = [0.5, 0.5];
  const r = 0.15;
  const shoulderPt = [elbowPt[0] + r, elbowPt[1]];
  const theta = (elbowTarget * Math.PI) / 180;
  const wristPt = [elbowPt[0] + r * Math.cos(theta), elbowPt[1] + r * Math.sin(theta)];

  const hipPt = [shoulderPt[0], shoulderPt[1] + 0.3];
  const shoulderDirFromHip = Math.atan2(shoulderPt[1] - hipPt[1], shoulderPt[0] - hipPt[0]);
  const ankleDir = shoulderDirFromHip + (bodyLineTarget * Math.PI) / 180;
  const r2 = 0.2;
  const anklePt = [hipPt[0] + r2 * Math.cos(ankleDir), hipPt[1] + r2 * Math.sin(ankleDir)];

  lm[11] = { x: shoulderPt[0], y: shoulderPt[1], visibility: 1 };
  lm[13] = { x: elbowPt[0], y: elbowPt[1], visibility: 1 };
  lm[15] = { x: wristPt[0], y: wristPt[1], visibility: 1 };
  lm[23] = { x: hipPt[0], y: hipPt[1], visibility: 1 };
  lm[27] = { x: anklePt[0], y: anklePt[1], visibility: 1 };
  return lm;
}

describe("PushupTracker", () => {
  it("never flags a full-depth rep as shallow", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170];
    for (const a of seq) t.processFrame(landmarksForPushup(a));
    expect(t.warningLog.has("shallow_pushup")).toBe(false);
    expect(t.badReps).toBe(0);
  });

  it("flags a rep that never reaches depth", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [170, 140, 95, 97, 93, 140, 170];
    for (const a of seq) t.processFrame(landmarksForPushup(a));
    expect(t.warningLog.has("shallow_pushup")).toBe(true);
    expect(t.badReps).toBe(1);
  });

  it("flags hip sag on an otherwise full-depth rep", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [
      [170, 180], [140, 150], [110, 145], [85, 140], [70, 140],
      [85, 145], [110, 150], [140, 150], [170, 155],
    ];
    for (const [elbow, body] of seq) t.processFrame(landmarksForPushup(elbow, body));
    expect(t.warningLog.has("hip_sag")).toBe(true);
    expect(t.badReps).toBe(1);
  });

  it("scores a clean full-depth straight-body rep at 100", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [
      [170, 180], [140, 180], [110, 180], [85, 180], [70, 180],
      [85, 180], [110, 180], [140, 180], [170, 180],
    ];
    for (const [elbow, body] of seq) t.processFrame(landmarksForPushup(elbow, body));
    expect(t.warningLog.size).toBe(0);
    expect(t.getFormScore()).toBe(100);
  });
});

describe("PushupTracker new_fault reporting", () => {
  it("reports hip_sag on the exact frame it fires", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [[170, 180], [140, 150], [110, 145]];
    let lastFrame = null;
    for (const [elbow, body] of seq) lastFrame = t.processFrame(landmarksForPushup(elbow, body));
    expect(lastFrame.new_fault).toBe("hip_sag");
  });

  it("is null on every frame of a clean rep", () => {
    const t = new PushupTracker();
    t.stage = "UP";
    const seq = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170];
    for (const a of seq) {
      const frame = t.processFrame(landmarksForPushup(a));
      expect(frame.new_fault).toBeNull();
    }
  });
});
