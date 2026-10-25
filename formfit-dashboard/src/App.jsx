import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import IntroPage from "./components/IntroPage";
import ExerciseGrid from "./components/ExerciseGrid";
import ExerciseDetail from "./components/ExerciseDetail";
import LiveSession from "./components/LiveSession";
import SessionResult from "./components/SessionResult";
import ProgressView from "./components/ProgressView";
import CreditsView from "./components/CreditsView";
import { fetchSessions, postSession, API_URL } from "./api";
import "./App.css";

function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState("exercises"); // exercises | detail | session | result | progress | credits

  const [sessions, setSessions] = useState([]);
  const [sessionsStatus, setSessionsStatus] = useState("loading"); // loading | ready | error

  const [pendingSummary, setPendingSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadSessions = useCallback(async () => {
    setSessionsStatus("loading");
    try {
      const data = await fetchSessions();
      setSessions(data);
      setSessionsStatus("ready");
    } catch {
      setSessionsStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSessionsStatus("loading");
      try {
        const data = await fetchSessions();
        if (cancelled) return;
        setSessions(data);
        setSessionsStatus("ready");
      } catch {
        if (!cancelled) setSessionsStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitSummary(summary) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await postSession(summary);
      setSubmitting(false);
      loadSessions();
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message);
    }
  }

  function handleSessionEnd(summary) {
    if (!summary) {
      setView("detail");
      return;
    }
    setPendingSummary(summary);
    setView("result");
    submitSummary(summary);
  }

  if (!entered) {
    return <IntroPage onEnter={() => setEntered(true)} />;
  }

  const latestScore = sessions[0]?.form_score ?? null;

  function renderMain() {
    switch (view) {
      case "detail":
        return (
          <ExerciseDetail onBack={() => setView("exercises")} onStart={() => setView("session")} />
        );
      case "session":
        return <LiveSession onEnd={handleSessionEnd} />;
      case "result":
        return (
          <SessionResult
            summary={pendingSummary}
            submitting={submitting}
            submitError={submitError}
            onDone={() => setView("exercises")}
            onRetry={() => submitSummary(pendingSummary)}
          />
        );
      case "progress":
        return (
          <ProgressView
            sessions={sessions}
            status={sessionsStatus}
            apiUrl={API_URL}
            onRetry={loadSessions}
          />
        );
      case "credits":
        return <CreditsView />;
      case "exercises":
      default:
        return <ExerciseGrid onSelect={() => setView("detail")} />;
    }
  }

  const activeNav = ["exercises", "detail", "session", "result"].includes(view)
    ? "exercises"
    : view;

  return (
    <div className="shell">
      <Sidebar
        active={activeNav}
        score={latestScore}
        onNavigate={(id) => setView(id)}
      />
      <main className="main" aria-busy={view === "session"}>
        {renderMain()}
      </main>
    </div>
  );
}

export default App;
