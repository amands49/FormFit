import { afterEach, describe, expect, it, vi } from "vitest";
import { RollingClipRecorder } from "./clipRecorder";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("RollingClipRecorder", () => {
  it("records the provided camera stream without stopping its tracks", () => {
    vi.useFakeTimers();
    const cameraTrack = { stop: vi.fn() };
    const cameraStream = { getTracks: () => [cameraTrack] };
    const recorders = [];

    class MockMediaRecorder {
      static isTypeSupported() {
        return true;
      }

      constructor(stream) {
        this.stream = stream;
        this.state = "inactive";
        recorders.push(this);
      }

      start() {
        this.state = "recording";
      }

      stop() {
        this.state = "inactive";
        this.onstop?.();
      }
    }

    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    const recorder = new RollingClipRecorder(cameraStream);

    expect(recorders[0].stream).toBe(cameraStream);
    recorder.stop();
    expect(cameraTrack.stop).not.toHaveBeenCalled();
  });
});
