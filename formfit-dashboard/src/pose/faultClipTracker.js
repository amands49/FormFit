/**
 * Decides WHEN to capture a clip (once per distinct fault tag per
 * session), independent of HOW the clip is actually recorded. Kept
 * separate from clipRecorder.js on purpose: this class is pure JS with
 * no browser APIs, so it's the one piece of the clip-capture feature
 * that can actually be unit tested in this environment. clipRecorder.js
 * (real MediaRecorder/camera usage) cannot be exercised by an automated
 * test here -- there's no browser or camera in this sandbox -- and needs
 * manual verification in an actual browser before you trust it live.
 */
export class FaultClipTracker {
  constructor() {
    this.captured = new Set();
  }

  /** Returns true exactly once per distinct fault tag; false every time after. */
  shouldCapture(tag) {
    if (!tag || this.captured.has(tag)) return false;
    this.captured.add(tag);
    return true;
  }

  reset() {
    this.captured.clear();
  }
}
