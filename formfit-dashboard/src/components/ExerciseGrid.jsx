import SquatFigure from "./SquatFigure";
import { EXERCISES } from "../exercises";

function ExerciseGrid({ onSelect }) {
  return (
    <section aria-label="Exercises">
      <h1 className="page-title">Exercises</h1>
      <p className="page-lede">
        Pick a movement to see the demo, form cues, and start a live session.
      </p>
      <div className="exercise-grid">
        {EXERCISES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className="exercise-card"
            onClick={() => onSelect(ex.id)}
          >
            <SquatFigure size={72} />
            <span className="exercise-card__name">{ex.name}</span>
            <span className="exercise-card__tagline">{ex.tagline}</span>
          </button>
        ))}
        <div className="exercise-card exercise-card--soon" aria-disabled="true">
          <span className="exercise-card__soon">More on the roadmap</span>
          <span className="exercise-card__tagline">
            Deadlift and press are next up in the exercise library.
          </span>
        </div>
      </div>
    </section>
  );
}

export default ExerciseGrid;
