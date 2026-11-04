/**
 * Continuously records the live camera stream in short, self-contained
 * segments, and exposes "the most recently completed segment" as a
 * playable clip URL.
 *
 * WHY SEGMENTS, NOT A TRUE ROLLING BUFFER: the obvious-seeming approach
 * is to request small chunks via MediaRecorder's `timeslice` option and
 * drop old chunks to keep a rolling window. That's unsafe for WebM: the
 * FIRST chunk of a recording carries the container header, and later
 * chunks are only valid appended to it -- trim the first chunk away and
 * the remaining data won't play. Concatenating multiple independent
 * complete recordings back-to-back has the same problem in reverse (each
 * has its own header, and playback across browsers is not reliably
 * consistent). Restarting the recorder every `segmentSeconds` and only
 * ever exposing ONE complete segment at a time avoids both failure modes
 * at the cost of some precision: the returned clip is "the last few
 * seconds of footage," not "the exact frames around the flagged rep."
 *
 * ON URL LIFETIME: each completed segment gets its own object URL, and
 * this class deliberately does NOT auto-revoke earlier ones -- an
 * earlier version of this file did, and that silently killed any clip a
 * caller had already captured and stored once the recording rolled to
 * its next segment (traced through by hand, not caught by a running
 * test -- there's no way to exercise this in this sandbox). Ownership of
 * a URL transfers to whoever calls getLatestClipUrl() and stores it;
 * call revokeAll() when a session's captured clips are truly done being
 * shown (e.g. leaving the results screen) to avoid leaking across many
 * sessions in one tab. A handful of short, low-res segments per single
 * workout session is a small, acceptable amount to hold in memory in
 * the meantime -- this is not designed for an always-on, long-running
 * recording.
 *
 * The stream is provided by getUserMedia and remains local to the browser.
 * This recorder does not own or stop its tracks.
 */
export class RollingClipRecorder {
  constructor(stream, { segmentSeconds = 5, mimeType = "video/webm;codecs=vp8" } = {}) {
    this.stream = stream;
    this.segmentSeconds = segmentSeconds;
    this.mimeType =
      typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mimeType)
        ? mimeType
        : "video/webm";
    this.lastCompletedSegmentUrl = null;
    this.allSegmentUrls = [];
    this.stopped = false;
    this.currentRecorder = null;
    this.segmentTimer = null;
    this._startSegment();
  }

  _startSegment() {
    if (this.stopped) return;
    const chunks = [];
    const recorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (this.stopped) return;
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: this.mimeType });
        const url = URL.createObjectURL(blob);
        this.lastCompletedSegmentUrl = url;
        this.allSegmentUrls.push(url);
      }
      if (!this.stopped) this._startSegment();
    };

    this.currentRecorder = recorder;
    recorder.start();
    this.segmentTimer = setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, this.segmentSeconds * 1000);
  }

  /** Most recently completed segment's clip URL, or null if none has finished yet. */
  getLatestClipUrl() {
    return this.lastCompletedSegmentUrl;
  }

  /** Call once the session's captured clips are no longer needed (e.g. user
   *  navigates away from the results screen), to free the object URLs. */
  revokeAll() {
    for (const url of this.allSegmentUrls) URL.revokeObjectURL(url);
    this.allSegmentUrls = [];
  }

  /** Revokes every tracked segment URL except the ones in `urlsToKeep` --
   *  call this once a session ends so the (usually many) uncaptured
   *  segments get cleaned up immediately, while the handful actually
   *  handed off to the results screen survive. */
  revokeExcept(urlsToKeep) {
    const keep = new Set(urlsToKeep);
    this.allSegmentUrls = this.allSegmentUrls.filter((url) => {
      if (keep.has(url)) return true;
      URL.revokeObjectURL(url);
      return false;
    });
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.segmentTimer);
    if (this.currentRecorder && this.currentRecorder.state !== "inactive") {
      this.currentRecorder.stop();
    }
  }
}
