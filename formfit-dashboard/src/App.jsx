import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import IntroPage from "./components/IntroPage";
import ExerciseGrid from "./components/ExerciseGrid";
import ExerciseDetail from "./components/ExerciseDetail";
import LiveSession from "./components/LiveSession";
import SessionResult from "./components/SessionResult";
import ProgressView from "./components/ProgressView";
import CreditsView from "./components/CreditsView";
import { EXERCISES } from "./exercises";
import { fetchSessions, postSession, API_URL } from "./api";
import "./App.css";

function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState("exercises"); // exercises | detail | session | result | progress | credits
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES[0].id);

  const [sessions, setSessions] = useState([]);
  const [sessionsStatus, setSessionsStatus] = useState("loading"); // loading | ready | error

  const [pendingSummary, setPendingSummary] = useState(null);
  const [pendingClips, setPendingClips] = useState({}); // { [faultTag]: objectUrl }
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Tracks whatever clip URLs are currently "live" (handed to the results
  // screen) so they can be revoked exactly once, whenever we move away
  // from showing them -- starting a new session or heading back to the
  // exercise list. Using a ref (not state) because this is cleanup
  // bookkeeping, not something that should trigger a re-render.
  const liveClipUrlsRef = useRef([]);

  const revokeLiveClips = useCallback(() => {
    for (const url of liveClipUrlsRef.current) URL.revokeObjectURL(url);
    liveClipUrlsRef.current = [];
  }, []);

  // Belt-and-suspenders: also clean up if the whole app unmounts (tab
  // close, hot reload) while clips are still live.
  useEffect(() => revokeLiveClips, [revokeLiveClips]);

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
      const saved = await postSession(summary);
      // Keep the original client-side summary shape (warnings as an
      // array) that SessionResult already renders, just attach the
      // backend's computed correction text -- see corrections.py for
      // why that text is computed server-side rather than sent by the
      // client.
      setPendingSummary((prev) => ({ ...(prev ?? summary), corrections: saved.corrections }));
      setSubmitting(false);
      loadSessions();
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message);
    }
  }

  function handleSessionEnd(summary, clips) {
    if (!summary) {
      setView("detail");
      return;
    }
    revokeLiveClips(); // clear out any clips left over from a prior session
    liveClipUrlsRef.current = Object.values(clips ?? {});
    setPendingSummary(summary);
    setPendingClips(clips ?? {});
    setView("result");
    submitSummary(summary);
  }

  function handleSelectExercise(exerciseId) {
    setSelectedExerciseId(exerciseId);
    setView("detail");
  }

  function handleDone() {
    revokeLiveClips();
    setPendingClips({});
    setView("exercises");
  }

  if (!entered) {
    return <IntroPage onEnter={() => setEntered(true)} />;
  }

  const selectedExercise =
    EXERCISES.find((ex) => ex.id === selectedExerciseId) ?? EXERCISES[0];
  const latestScore = sessions[0]?.form_score ?? null;

  function renderMain() {
    switch (view) {
      case "detail":
        return (
          <ExerciseDetail
            exercise={selectedExercise}
            onBack={() => setView("exercises")}
            onStart={() => setView("session")}
          />
        );
      case "session":
        return <LiveSession exercise={selectedExercise} onEnd={handleSessionEnd} />;
      case "result":
        return (
          <SessionResult
            summary={pendingSummary}
            clips={pendingClips}
            submitting={submitting}
            submitError={submitError}
            onDone={handleDone}
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
        return <ExerciseGrid onSelect={handleSelectExercise} />;
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
