// Kept separate from PoseFigure.jsx: mixing a component export with a
// plain function export in the same file breaks Vite's Fast Refresh
// (caught by eslint-plugin-react-refresh -- this split isn't cosmetic).

const FAULT_VISUAL_TAGS = {
  squat: new Set(["forward_lean", "shallow_squat"]),
  pushup: new Set(["hip_sag", "shallow_pushup"]),
  lunge: new Set(["forward_lean", "shallow_lunge"]),
};

/** True only when PoseFigure actually has an illustrated pose for this
 *  exercise+tag pair. "forward_lean" exists for both squat and lunge with
 *  DIFFERENT art, so this is keyed by the pair, not the tag alone. */
export function hasFaultVisual(exercise, tag) {
  return FAULT_VISUAL_TAGS[exercise]?.has(tag) ?? false;
}
