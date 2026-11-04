"""
corrections.py
----------------
Canonical, read-time mapping from fault tags to correction cues. See
Exercise_metrics.py for why this lives here and not in the database.

NOTE ON DUPLICATION: both the desktop CV engine (Exercise_prg.py) and the
browser engine (formfit-dashboard/src/pose/squatTracker.js) keep their own
copy of this same mapping, because each needs it instantly during a live
session with no network round-trip. Keep all three in sync manually.
"""

CORRECTIONS = {
    "Squat": {
        "forward_lean": "Keep your chest up and sit back into your hips.",
        "shallow_squat": "Lower your hips further — aim for thighs parallel to the floor.",
    },
    "Push-up": {
        "hip_sag": "Brace your core and keep hips, shoulders, and ankles in one line.",
        "shallow_pushup": "Lower your chest closer to the floor before pressing back up.",
    },
    "Lunge": {
        "forward_lean": "Keep your torso upright — don't tip forward over your front knee.",
        "shallow_lunge": "Bend the front knee further, until your thigh is closer to parallel with the floor.",
    },
}

DEFAULT_CORRECTION = "Adjust your form and try again."


def get_correction(exercise: str, tag: str) -> str:
    return CORRECTIONS.get(exercise, {}).get(tag, DEFAULT_CORRECTION)


def get_corrections_for_tags(exercise: str, tags: list[str]) -> list[str]:
    """De-duplicated, order-preserving list of correction cues for a session."""
    seen = set()
    result = []
    for tag in tags:
        cue = get_correction(exercise, tag)
        if cue not in seen:
            seen.add(cue)
            result.append(cue)
    return result
