/**
 * Sessions arrive from GET /sessions ordered newest first, with `warnings`
 * as a comma-separated tag string (e.g. "forward_lean,shallow_squat") and
 * `corrections` as the backend's computed correction text for those same
 * tags, in the same order (see formfit-backend/main.py:build_session_out).
 * Everything here just reshapes that into what the dashboard renders.
 */

export function chronological(sessions) {
  return [...sessions].reverse();
}

export function parseWarnings(warnings) {
  if (!warnings) return [];
  return warnings
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
}

export function averageScore(sessions) {
  if (sessions.length === 0) return null;
  const total = sessions.reduce((sum, s) => sum + s.form_score, 0);
  return total / sessions.length;
}

export function totalReps(sessions) {
  return sessions.reduce((sum, s) => sum + s.reps, 0);
}

/** Latest session's score minus the average of the prior 4, for a trend arrow. */
export function recentTrend(sessions) {
  if (sessions.length < 2) return null;
  const [latest, ...rest] = sessions; // sessions is newest-first here
  const priorWindow = rest.slice(0, 4);
  const priorAvg = averageScore(priorWindow);
  if (priorAvg === null) return null;
  return latest.form_score - priorAvg;
}

export function faultFrequency(sessions) {
  const counts = new Map();
  for (const session of sessions) {
    for (const tag of parseWarnings(session.warnings)) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * tag -> correction text, picked from the first session where that tag
 * appears. `parseWarnings(session.warnings)` and `session.corrections`
 * are guaranteed the same length and order by construction on the
 * backend (both derive from the same stored tag list), so zipping by
 * index here is safe -- see build_session_out in formfit-backend/main.py.
 */
export function faultCorrections(sessions) {
  const map = new Map();
  for (const session of sessions) {
    const tags = parseWarnings(session.warnings);
    const corrections = session.corrections || [];
    tags.forEach((tag, i) => {
      if (!map.has(tag) && corrections[i]) {
        map.set(tag, corrections[i]);
      }
    });
  }
  return map;
}

export function scoreBand(score) {
  if (score >= 90) return "clean";
  if (score >= 75) return "caution";
  return "fault";
}
