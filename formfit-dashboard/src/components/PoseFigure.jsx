// ---------- Squat poses ----------

function SquatStanding() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
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

function SquatBottom() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
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

/** Same depth as SquatBottom (legs unchanged -- this fault is torso-only), head/shoulders pitched further forward. */
function SquatLean() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="102" cy="74" r="14" fill="var(--plate-red)" stroke="none" />
      <line x1="96" y1="84" x2="80" y2="138" />
      <line x1="96" y1="84" x2="62" y2="104" />
      <line x1="96" y1="84" x2="130" y2="104" />
      <line x1="80" y1="138" x2="57" y2="155" stroke="var(--iron)" />
      <line x1="57" y1="155" x2="63" y2="190" stroke="var(--iron)" />
      <line x1="80" y1="138" x2="103" y2="155" stroke="var(--iron)" />
      <line x1="103" y1="155" x2="97" y2="190" stroke="var(--iron)" />
      <circle cx="57" cy="155" r="5" fill="var(--plate-green)" stroke="none" />
      <circle cx="103" cy="155" r="5" fill="var(--plate-green)" stroke="none" />
    </g>
  );
}

/** Midway between SquatStanding and SquatBottom -- reads as "only partway down." */
function SquatShallow() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="83" cy="51" r="14" fill="var(--plate-red)" stroke="none" />
      <line x1="81" y1="65" x2="80" y2="117" />
      <line x1="81" y1="76" x2="50" y2="99" />
      <line x1="81" y1="76" x2="112" y2="99" />
      <line x1="80" y1="117" x2="60" y2="151" />
      <line x1="60" y1="151" x2="63" y2="190" />
      <line x1="80" y1="117" x2="100" y2="151" />
      <line x1="100" y1="151" x2="97" y2="190" />
      <circle cx="60" cy="151" r="5" fill="var(--plate-yellow)" stroke="none" />
      <circle cx="100" cy="151" r="5" fill="var(--plate-yellow)" stroke="none" />
    </g>
  );
}

// ---------- Push-up poses (side view, plank line running shoulder-hip-ankle) ----------

function PushupTop() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="136" cy="55" r="13" fill="var(--iron)" stroke="none" />
      <line x1="120" y1="70" x2="75" y2="108" />
      <line x1="75" y1="108" x2="28" y2="148" />
      <line x1="120" y1="70" x2="120" y2="108" />
      <line x1="120" y1="108" x2="120" y2="148" />
      <circle cx="120" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
      <circle cx="28" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
    </g>
  );
}

function PushupBottom() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="128" cy="82" r="13" fill="var(--iron)" stroke="none" />
      <line x1="112" y1="95" x2="72" y2="118" />
      <line x1="72" y1="118" x2="28" y2="148" />
      <line x1="112" y1="95" x2="128" y2="120" />
      <line x1="128" y1="120" x2="120" y2="148" />
      <circle cx="120" cy="148" r="5" fill="var(--plate-green)" stroke="none" />
      <circle cx="28" cy="148" r="5" fill="var(--plate-green)" stroke="none" />
    </g>
  );
}

/** Same arm position as PushupTop (fault is hip position, not depth) but hips dropped well below the shoulder-ankle line. */
function PushupSag() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="136" cy="55" r="13" fill="var(--plate-red)" stroke="none" />
      <line x1="120" y1="70" x2="80" y2="135" />
      <line x1="80" y1="135" x2="28" y2="148" />
      <line x1="120" y1="70" x2="120" y2="108" stroke="var(--iron)" />
      <line x1="120" y1="108" x2="120" y2="148" stroke="var(--iron)" />
      <circle cx="120" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
      <circle cx="28" cy="148" r="5" fill="var(--plate-blue)" stroke="none" />
    </g>
  );
}

/** Midway between PushupTop and PushupBottom -- barely lowered, hips still in line. */
function PushupShallow() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="133" cy="64" r="13" fill="var(--plate-red)" stroke="none" />
      <line x1="117" y1="79" x2="74" y2="112" />
      <line x1="74" y1="112" x2="28" y2="148" />
      <line x1="117" y1="79" x2="123" y2="112" />
      <line x1="123" y1="112" x2="120" y2="148" />
      <circle cx="120" cy="148" r="5" fill="var(--plate-yellow)" stroke="none" />
      <circle cx="28" cy="148" r="5" fill="var(--plate-yellow)" stroke="none" />
    </g>
  );
}

// ---------- Lunge poses (side view, front leg forward-bent, back leg extended) ----------

function LungeStanding() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="80" cy="30" r="14" fill="var(--iron)" stroke="none" />
      <line x1="80" y1="44" x2="80" y2="100" />
      <line x1="80" y1="58" x2="52" y2="88" />
      <line x1="80" y1="58" x2="108" y2="88" />
      <line x1="80" y1="100" x2="80" y2="145" />
      <line x1="80" y1="145" x2="80" y2="190" />
      <circle cx="80" cy="145" r="5" fill="var(--plate-blue)" stroke="none" />
    </g>
  );
}

function LungeBottom() {
  return (
    <g fill="none" stroke="var(--iron)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="78" cy="35" r="13" fill="var(--iron)" stroke="none" />
      <line x1="78" y1="48" x2="80" y2="95" />
      <line x1="78" y1="48" x2="52" y2="76" />
      <line x1="78" y1="48" x2="104" y2="76" />
      <line x1="80" y1="95" x2="105" y2="130" />
      <line x1="105" y1="130" x2="108" y2="175" />
      <line x1="80" y1="95" x2="58" y2="150" />
      <line x1="58" y1="150" x2="50" y2="188" />
      <circle cx="105" cy="130" r="5" fill="var(--plate-green)" stroke="none" />
      <circle cx="58" cy="150" r="5" fill="var(--plate-green)" stroke="none" />
    </g>
  );
}

/** Same leg positions as LungeBottom (fault is torso-only) but shoulders/head pitched forward. */
function LungeLean() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="100" cy="70" r="13" fill="var(--plate-red)" stroke="none" />
      <line x1="95" y1="80" x2="80" y2="95" />
      <line x1="95" y1="80" x2="65" y2="90" />
      <line x1="95" y1="80" x2="122" y2="92" />
      <line x1="80" y1="95" x2="105" y2="130" stroke="var(--iron)" />
      <line x1="105" y1="130" x2="108" y2="175" stroke="var(--iron)" />
      <line x1="80" y1="95" x2="58" y2="150" stroke="var(--iron)" />
      <line x1="58" y1="150" x2="50" y2="188" stroke="var(--iron)" />
      <circle cx="105" cy="130" r="5" fill="var(--plate-green)" stroke="none" />
      <circle cx="58" cy="150" r="5" fill="var(--plate-green)" stroke="none" />
    </g>
  );
}

/** Upright torso like LungeBottom, but front knee only partially bent -- didn't reach depth. */
function LungeShallow() {
  return (
    <g fill="none" stroke="var(--plate-red)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="78" cy="35" r="13" fill="var(--plate-red)" stroke="none" />
      <line x1="78" y1="48" x2="80" y2="95" />
      <line x1="78" y1="48" x2="52" y2="76" />
      <line x1="78" y1="48" x2="104" y2="76" />
      <line x1="80" y1="95" x2="90" y2="136" />
      <line x1="90" y1="136" x2="91" y2="178" />
      <line x1="80" y1="95" x2="71" y2="144" />
      <line x1="71" y1="144" x2="68" y2="183" />
      <circle cx="90" cy="136" r="5" fill="var(--plate-yellow)" stroke="none" />
      <circle cx="71" cy="144" r="5" fill="var(--plate-yellow)" stroke="none" />
    </g>
  );
}

// ---------- Registries ----------

const NEUTRAL_POSES = {
  squat: SquatStanding,
  pushup: PushupTop,
  lunge: LungeStanding,
};

const CORRECT_POSES = {
  squat: SquatBottom,
  pushup: PushupBottom,
  lunge: LungeBottom,
};

const FAULT_POSES = {
  squat: { forward_lean: SquatLean, shallow_squat: SquatShallow },
  pushup: { hip_sag: PushupSag, shallow_pushup: PushupShallow },
  lunge: { forward_lean: LungeLean, shallow_lunge: LungeShallow },
};

/**
 * `pose`: "neutral" (default, used for the animated cycle's start state and
 *   card icons) | "correct" (the end-of-rep position to compare a fault
 *   against -- NOT the same as neutral/standing, that was a bug in an
 *   earlier version of this component: comparing a fault against "standing"
 *   doesn't actually show what correct form looks like).
 * `variant`: a fault tag -- overrides `pose` and shows that fault's figure.
 * `animated`: cross-fades neutral <-> correct, ignores `pose`/`variant`.
 */
function PoseFigure({ exercise = "squat", animated = false, size = 96, variant = null, pose = "neutral" }) {
  const Neutral = NEUTRAL_POSES[exercise] ?? NEUTRAL_POSES.squat;
  const Correct = CORRECT_POSES[exercise] ?? CORRECT_POSES.squat;
  const VariantPose = variant ? FAULT_POSES[exercise]?.[variant] : null;

  let Body;
  if (!animated) {
    Body = VariantPose ?? (pose === "correct" ? Correct : Neutral);
  }

  return (
    <svg
      viewBox="0 0 160 200"
      width={size}
      height={(size * 200) / 160}
      role="img"
      aria-label={
        VariantPose
          ? `Stick figure demonstrating a ${exercise} form fault`
          : `Stick figure demonstrating a ${exercise}`
      }
      className={animated ? "squat-figure squat-figure--animated" : "squat-figure"}
    >
      <line x1="20" y1="192" x2="140" y2="192" stroke="var(--hairline-strong)" strokeWidth="3" />
      {animated ? (
        <>
          <g className="squat-figure__standing">
            <Neutral />
          </g>
          <g className="squat-figure__bottom">
            <Correct />
          </g>
        </>
      ) : (
        <Body />
      )}
    </svg>
  );
}

export default PoseFigure;
