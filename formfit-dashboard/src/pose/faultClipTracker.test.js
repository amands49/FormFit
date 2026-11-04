import { describe, it, expect } from "vitest";
import { FaultClipTracker } from "./faultClipTracker";

describe("FaultClipTracker", () => {
  it("captures the first time a tag is seen", () => {
    const t = new FaultClipTracker();
    expect(t.shouldCapture("forward_lean")).toBe(true);
  });

  it("does not capture the same tag twice", () => {
    const t = new FaultClipTracker();
    t.shouldCapture("forward_lean");
    expect(t.shouldCapture("forward_lean")).toBe(false);
  });

  it("captures each distinct tag once", () => {
    const t = new FaultClipTracker();
    expect(t.shouldCapture("forward_lean")).toBe(true);
    expect(t.shouldCapture("shallow_squat")).toBe(true);
    expect(t.shouldCapture("forward_lean")).toBe(false);
    expect(t.shouldCapture("shallow_squat")).toBe(false);
  });

  it("ignores null/undefined tags without marking anything captured", () => {
    const t = new FaultClipTracker();
    expect(t.shouldCapture(null)).toBe(false);
    expect(t.shouldCapture(undefined)).toBe(false);
    expect(t.shouldCapture("forward_lean")).toBe(true);
  });

  it("reset() allows re-capturing", () => {
    const t = new FaultClipTracker();
    t.shouldCapture("forward_lean");
    t.reset();
    expect(t.shouldCapture("forward_lean")).toBe(true);
  });
});
