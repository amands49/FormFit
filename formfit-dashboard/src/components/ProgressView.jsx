import OverviewPanel from "./OverviewPanel";
import ProgressChart from "./ProgressChart";
import FaultBreakdown from "./FaultBreakdown";
import SessionList from "./SessionList";
import {
  averageScore,
  chronological,
  faultFrequency,
  recentTrend,
  scoreBand,
  totalReps,
} from "../stats";

function ProgressBar({ score }) {
  const value = score ?? 0;
  const band = scoreBand(value);
  return (
    <div className="progress-bar" role="img" aria-label={`Form quality ${Math.round(value)} out of 100`}>
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${band}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <div className="progress-bar__ends">
        <span>0</span>
        <span>Form quality</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ProgressView({ sessions, status, apiUrl, onRetry }) {
  if (status === "loading") {
    return <p className="loading-state">Loading session history…</p>;
  }

  if (status === "error") {
    return (
      <div className="error-state">
        <h1>Can't reach the FormFit backend</h1>
        <p>
          Expected the FastAPI server at <code>{apiUrl}</code>. Start it with{" "}
          <code>uvicorn main:app --reload</code> from <code>formfit-backend/</code>,
          then retry.
        </p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  const latestSession = sessions[0] ?? null;
  const avg = averageScore(sessions);
  const orderedOldestFirst = chronological(sessions);

  return (
    <section aria-label="Progress">
      <h1 className="page-title">Progress</h1>
      <p className="page-lede">Score, trend, and history across every logged set.</p>

      <OverviewPanel
        latestSession={latestSession}
        avgScore={avg}
        totalSessions={sessions.length}
        reps={totalReps(sessions)}
        trend={recentTrend(sessions)}
      />

      <ProgressBar score={latestSession ? latestSession.form_score : avg} />

      <ProgressChart sessions={orderedOldestFirst} />

      <div className="grid-two">
        <FaultBreakdown faults={faultFrequency(sessions)} />
        <SessionList sessions={sessions} />
      </div>
    </section>
  );
}

export default ProgressView;
