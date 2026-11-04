import PoseFigure from "./PoseFigure";
import { getReferenceMedia } from "../pose/referenceMedia";

/**
 * Drop-in replacement for using PoseFigure directly. Checks for real
 * recorded reference media first (see pose/referenceMedia.js); if none
 * has been supplied yet for this exercise+pose, falls back to the
 * illustrated stick figure so nothing breaks in the meantime.
 *
 * `poseKey`: "neutral" | "correct" | a fault tag.
 */
function PoseVisual({ exercise, poseKey, animated = false, size = 96, alt }) {
  // For the animated hero slot, prefer a real video of a correct rep over
  // the SVG cross-fade cycle, but only if it's actually a video -- a
  // single static photo doesn't convey a "cycle" the way the illustrated
  // animation does, so a photo-only reference still falls back below.
  const media = animated
    ? (() => {
        const correctMedia = getReferenceMedia(exercise, "correct");
        return correctMedia?.isVideo ? correctMedia : null;
      })()
    : getReferenceMedia(exercise, poseKey);

  if (media) {
    const height = Math.round((size * 200) / 160);
    return media.isVideo ? (
      <video
        src={media.src}
        className="pose-visual__media"
        style={{ width: size, height }}
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt}
      />
    ) : (
      <img
        src={media.src}
        className="pose-visual__media"
        style={{ width: size, height }}
        alt={alt ?? ""}
      />
    );
  }

  // No real footage yet for this pose -- illustrated figure fallback.
  const props = { exercise, size, animated };
  if (poseKey === "correct") props.pose = "correct";
  else if (poseKey && poseKey !== "neutral") props.variant = poseKey;
  return <PoseFigure {...props} />;
}

export default PoseVisual;
