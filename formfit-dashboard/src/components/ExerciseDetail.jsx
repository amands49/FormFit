import SquatFigure from "./SquatFigure";

const DIRECTIONS = [
  "Stand with feet shoulder-width apart, toes turned slightly out.",
  "Brace your core and keep your chest up through the whole rep.",
  "Push your hips back and bend your knees together, not one before the other.",
  "Sink until your thighs are roughly parallel to the floor.",
  "Keep your knees tracking over your toes — don't let them cave in.",
  "Drive through your heels to stand back up to full extension.",
];

function ExerciseDetail({ onBack, onStart }) {
  return (
    <section aria-label="Squat">
      <button type="button" className="back-link" onClick={onBack}>
        ← Exercises
      </button>

      <div className="detail">
        <div className="detail__demo">
          <SquatFigure animated size={200} />
          <span className="detail__demo-caption">Squat cycle</span>
        </div>

        <div className="detail__body">
          <h1 className="page-title">Squat</h1>
          <p className="page-lede">
            FormFit AI tracks your hip, knee, and back angles frame by frame
            and flags forward lean the moment it happens.
          </p>

          <h2 className="detail__subhead">How to squat efficiently</h2>
          <ol className="directions">
            {DIRECTIONS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <button type="button" className="start-session-btn" onClick={onStart}>
            Start session
          </button>
        </div>
      </div>
    </section>
  );
}

export default ExerciseDetail;
