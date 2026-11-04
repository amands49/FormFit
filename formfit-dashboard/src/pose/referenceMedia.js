/**
 * Real reference photos or short clips of correct and faulty form, once
 * you've recorded them. Populate this and every comparison in the app
 * (FaultDemo, ExerciseGrid, ExerciseDetail) switches from the illustrated
 * stick figure to the real image/video automatically -- see PoseVisual.jsx.
 *
 * Deliberately empty for now rather than filled with AI-generated or
 * scraped stock images: neither can be made to precisely match a specific
 * measured fault, and scraped images aren't licensed for use in a shipped
 * product. Record real footage of yourselves and drop the file paths in
 * here -- put the actual image/video files under formfit-dashboard/public/
 * and reference them as "/filename.jpg" etc.
 *
 * Shape: { [exerciseId]: { [poseKey]: "/path/to/file.jpg-or-mp4" } }
 * poseKey is "correct", "neutral", or a specific fault tag
 * (e.g. "forward_lean", "shallow_squat", "hip_sag", "shallow_pushup",
 * "shallow_lunge").
 */
export const REFERENCE_MEDIA = {
  // squat: {
  //   neutral: "/reference/squat-standing.jpg",
  //   correct: "/reference/squat-bottom.jpg",
  //   forward_lean: "/reference/squat-forward-lean.jpg",
  //   shallow_squat: "/reference/squat-shallow.jpg",
  // },
  // pushup: { ... },
  // lunge: { ... },
};

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export function getReferenceMedia(exercise, poseKey) {
  const src = REFERENCE_MEDIA[exercise]?.[poseKey];
  if (!src) return null;
  const isVideo = VIDEO_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext));
  return { src, isVideo };
}
