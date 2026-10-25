import { formatWarningTag } from "../api";
import { scoreBand } from "../stats";

function SessionResult({ summary, submitting, submitError, onDone, onRetry }) {
  const band = scoreBand(summary.form_score);

  return (
    <section aria-label="Session result">
      <h1 className="page-title">Session complete</h1>

      <div className="result-card">
        <span className={`result-card__score result-card__score--${band}`}>
          {Math.round(summary.form_score)}
        </span>
        <dl className="result-card__stats">
          <div>
            <dt>Exercise</dt>
            <dd>{summary.exercise}</dd>
          </div>
          <div>
            <dt>Reps</dt>
            <dd>{summary.reps}</dd>
          </div>
          <div>
            <dt>Faults flagged</dt>
            <dd>
              {summary.warnings.length === 0
                ? "None"
                : summary.warnings.map(formatWarningTag).join(", ")}
            </dd>
          </div>
        </dl>
      </div>

      {submitting && <p className="result-status">Saving to your session log…</p>}
      {submitError && (
        <div className="result-status result-status--error">
          <p>Couldn't save this session: {submitError}</p>
          <button type="button" className="start-session-btn" onClick={onRetry}>
            Retry save
          </button>
        </div>
      )}

      <button type="button" className="start-session-btn" onClick={onDone}>
        Back to exercises
      </button>
    </section>
  );
}

export default SessionResult;
