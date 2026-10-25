function StandingPose() {
  return (
    <g
      fill="none"
      stroke="var(--iron)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="80" cy="30" r="14" fill="var(--iron)" stroke="none" />
      <line x1="80" y1="44" x2="80" y2="100" />
      <line x1="80" y1="58" x2="52" y2="88" />
      <line x1="80" y1="58" x2="108" y2="88" />
      <line x1="80" y1="100" x2="63" y2="148" />
      <line x1="63" y1="148" x2="63" y2="190" />
      <line x1="80" y1="100" x2="97" y2="148" />
      <line x1="97" y1="148" x2="97" y2="190" />
      <circle cx="63" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
      <circle cx="97" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
    </g>
  );
}

function BottomPose() {
  return (
    <g
      fill="none"
      stroke="var(--iron)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="86" cy="76" r="14" fill="var(--iron)" stroke="none" />
      <line x1="83" y1="90" x2="80" y2="138" />
      <line x1="82" y1="98" x2="48" y2="112" />
      <line x1="82" y1="98" x2="116" y2="112" />
      <line x1="80" y1="138" x2="57" y2="155" />
      <line x1="57" y1="155" x2="63" y2="190" />
      <line x1="80" y1="138" x2="103" y2="155" />
      <line x1="103" y1="155" x2="97" y2="190" />
      <circle cx="57" cy="155" r="5" fill="var(--plate-green)" stroke="none" />
      <circle cx="103" cy="155" r="5" fill="var(--plate-green)" stroke="none" />
    </g>
  );
}

/** `animated` cross-fades standing <-> bottom to suggest the squat cycle without a video asset. */
function SquatFigure({ animated = false, size = 96 }) {
  return (
    <svg
      viewBox="0 0 160 200"
      width={size}
      height={(size * 200) / 160}
      role="img"
      aria-label="Stick figure demonstrating a squat"
      className={animated ? "squat-figure squat-figure--animated" : "squat-figure"}
    >
      <line x1="20" y1="192" x2="140" y2="192" stroke="var(--hairline-strong)" strokeWidth="3" />
      {animated ? (
        <>
          <g className="squat-figure__standing">
            <StandingPose />
          </g>
          <g className="squat-figure__bottom">
            <BottomPose />
          </g>
        </>
      ) : (
        <StandingPose />
      )}
    </svg>
  );
}

export default SquatFigure;
