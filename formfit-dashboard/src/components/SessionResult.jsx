import { formatWarningTag } from "../api";
import { scoreBand } from "../stats";
import { EXERCISES } from "../exercises";
import FaultDemo from "./FaultDemo";

function SessionResult({ summary, clips, submitting, submitError, onDone, onRetry }) {
  const band = scoreBand(summary.form_score);
  const hasFaults = summary.warnings.length > 0;
  // Attached by App.jsx once the backend responds (see submitSummary) --
  // undefined while still submitting, which is fine: the demo section
  // just doesn't render yet rather than showing stale/wrong text.
  const corrections = summary.corrections;
  // Session summaries carry the display name ("Push-up"), but PoseFigure
  // and hasFaultVisual are keyed by id ("pushup") -- look it up once here.
  const exerciseId = EXERCISES.find((ex) => ex.name === summary.exercise)?.id ?? "squat";

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
            <dd>{hasFaults ? summary.warnings.map(formatWarningTag).join(", ") : "None"}</dd>
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

      {hasFaults && corrections && (
        <div className="fault-demos">
          <h2 className="detail__subhead">What to work on</h2>
          {summary.warnings.map((tag, i) => (
            <FaultDemo
              key={tag}
              exercise={exerciseId}
              faultTag={tag}
              correctionText={corrections[i] ?? "Adjust your form and try again."}
              clipUrl={clips?.[tag]}
            />
          ))}
        </div>
      )}

      <button type="button" className="start-session-btn" onClick={onDone}>
        Back to exercises
      </button>
    </section>
  );
}

export default SessionResult;
