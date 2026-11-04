import PoseVisual from "./PoseVisual";
import { hasFaultVisual } from "./faultVisuals";
import { formatWarningTag } from "../api";

/**
 * Shows what a flagged fault looked like next to correct end-of-rep form.
 * Uses real recorded reference footage once it exists (see
 * pose/referenceMedia.js); until then, falls back to the illustrated
 * stick figure -- but only for exercise+fault pairs that HAVE an
 * illustrated pose (currently: Squat's two fault types). Otherwise this
 * shows text-only correction rather than a wrong or misleading pose.
 *
 * `clipUrl`, when present, is the user's own captured rep around the
 * moment this fault fired -- shown above everything else, since real
 * footage of the actual person is more useful than any reference.
 */
function FaultDemo({ exercise, faultTag, correctionText, clipUrl }) {
  const showFigures = hasFaultVisual(exercise, faultTag);

  return (
    <div className="fault-demo">
      {clipUrl && (
        <video
          className="fault-demo__clip"
          src={clipUrl}
          controls
          loop
          muted
          playsInline
          aria-label={`Your ${formatWarningTag(faultTag).toLowerCase()} rep`}
        />
      )}
      {showFigures && (
        <div className="fault-demo__pair">
          <div className="fault-demo__figure">
            <PoseVisual exercise={exercise} poseKey={faultTag} size={104} alt={`${formatWarningTag(faultTag)} example`} />
            <span className="fault-demo__caption fault-demo__caption--fault">What happened</span>
          </div>
          <div className="fault-demo__figure">
            <PoseVisual exercise={exercise} poseKey="correct" size={104} alt="Correct form" />
            <span className="fault-demo__caption fault-demo__caption--good">Aim for this</span>
          </div>
        </div>
      )}
      <div className="fault-demo__text">
        <span className="fault-demo__label">{formatWarningTag(faultTag)}</span>
        <p className="fault-demo__correction">{correctionText}</p>
      </div>
    </div>
  );
}

export default FaultDemo;
