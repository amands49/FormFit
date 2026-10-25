import { formatWarningTag } from "../api";
import { parseWarnings, scoreBand } from "../stats";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionList({ sessions }) {
  if (sessions.length === 0) {
    return (
      <section className="panel" aria-label="Session history">
        <h2 className="panel__title">Session history</h2>
        <p className="panel__empty">
          Nothing logged yet. Run a set through the CV engine and press{" "}
          <code>q</code> to submit — it lands here.
        </p>
      </section>
    );
  }

  return (
    <section className="panel" aria-label="Session history">
      <h2 className="panel__title">Session history</h2>
      <ul className="sessions">
        {sessions.map((s) => {
          const band = scoreBand(s.form_score);
          const warnings = parseWarnings(s.warnings);
          return (
            <li key={s.id} className="sessions__row">
              <span className={`sessions__badge sessions__badge--${band}`}>
                {Math.round(s.form_score)}
              </span>
              <div className="sessions__main">
                <div className="sessions__line1">
                  <span className="sessions__exercise">{s.exercise}</span>
                  <span className="sessions__reps">{s.reps} reps</span>
                </div>
                <div className="sessions__line2">
                  <time dateTime={s.created_at}>{formatDate(s.created_at)}</time>
                  {warnings.length > 0 && (
                    <span className="sessions__chips">
                      {warnings.map((w) => (
                        <span key={w} className="chip">
                          {formatWarningTag(w)}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default SessionList;
