import { scoreBand } from "../stats";

function TrendTag({ trend }) {
  if (trend === null) return null;
  const rounded = Math.round(trend * 10) / 10;
  if (Math.abs(rounded) < 0.5) {
    return <span className="trend trend--flat">holding steady</span>;
  }
  const up = rounded > 0;
  return (
    <span className={`trend ${up ? "trend--up" : "trend--down"}`}>
      {up ? "↑" : "↓"} {Math.abs(rounded)} pts vs last few sets
    </span>
  );
}

function OverviewPanel({ latestSession, avgScore, totalSessions, reps, trend }) {
  const displayScore = latestSession ? latestSession.form_score : avgScore;
  const band = displayScore !== null ? scoreBand(displayScore) : "clean";

  return (
    <section className="overview" aria-label="Overall form score">
      <div className="overview__score">
        <span className="overview__label">
          {latestSession ? "Latest set" : "Average form score"}
        </span>
        <span className={`overview__number overview__number--${band}`}>
          {displayScore !== null ? Math.round(displayScore) : "—"}
        </span>
        <TrendTag trend={trend} />
      </div>
      <dl className="overview__stats">
        <div className="overview__stat">
          <dt>Sessions logged</dt>
          <dd>{totalSessions}</dd>
        </div>
        <div className="overview__stat">
          <dt>Total reps</dt>
          <dd>{reps}</dd>
        </div>
        <div className="overview__stat">
          <dt>Last exercise</dt>
          <dd>{latestSession ? latestSession.exercise : "—"}</dd>
        </div>
      </dl>
    </section>
  );
}

export default OverviewPanel;
