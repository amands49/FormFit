const STACK = [
  { layer: "CV engine", tech: "Python, OpenCV, MediaPipe", role: "Pose tracking, joint-angle math, rep counting, fault detection" },
  { layer: "Backend", tech: "FastAPI, SQLAlchemy, SQLite", role: "REST API and session persistence" },
  { layer: "Frontend", tech: "React", role: "This dashboard — live sessions, trends, and history" },
];

function CreditsView() {
  return (
    <section aria-label="Credits">
      <h1 className="page-title">Credits</h1>
      <p className="page-lede">
        FormFit AI was built by <strong>Team GIT FIT</strong> for{" "}
        <strong>MIRAETHON 2K26</strong> — a real-time, computer-vision form
        coach that trades lab-grade precision for a single webcam and zero
        setup.
      </p>

      <h2 className="detail__subhead">Stack</h2>
      <table className="credits-table">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technology</th>
            <th>Responsibility</th>
          </tr>
        </thead>
        <tbody>
          {STACK.map((row) => (
            <tr key={row.layer}>
              <td>{row.layer}</td>
              <td>{row.tech}</td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="credits-note">
        Pose detection in this dashboard's live session runs entirely in your
        browser via MediaPipe's Tasks Vision runtime, using the same
        pose-landmark model as the desktop CV engine.
      </p>
    </section>
  );
}

export default CreditsView;
