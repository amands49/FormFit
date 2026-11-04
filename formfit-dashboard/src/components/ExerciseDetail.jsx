import PoseVisual from "./PoseVisual";

function ExerciseDetail({ exercise, onBack, onStart }) {
  return (
    <section aria-label={exercise.name}>
      <button type="button" className="back-link" onClick={onBack}>
        ← Exercises
      </button>

      <div className="detail">
        <div className="detail__demo">
          <PoseVisual exercise={exercise.id} poseKey="correct" animated size={200} alt={`${exercise.name} demo`} />
          <span className="detail__demo-caption">{exercise.name} cycle</span>
        </div>

        <div className="detail__body">
          <h1 className="page-title">{exercise.name}</h1>
          <p className="page-lede">{exercise.summary}</p>

          <h2 className="detail__subhead">How to {exercise.name.toLowerCase()} efficiently</h2>
          <ol className="directions">
            {exercise.directions.map((step) => (
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
