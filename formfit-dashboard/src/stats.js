/**
 * Sessions arrive from GET /sessions ordered newest first, with `warnings`
 * as a comma-separated tag string (e.g. "forward_lean,knee_valgus").
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

export function scoreBand(score) {
  if (score >= 90) return "clean";
  if (score >= 75) return "caution";
  return "fault";
}
