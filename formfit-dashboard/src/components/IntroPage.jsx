import SquatFigure from "./SquatFigure";

function IntroPage({ onEnter }) {
  return (
    <div className="intro">
      <div className="intro__content">
        <span className="intro__eyebrow">Team GIT FIT · MIRAETHON 2K26</span>
        <h1 className="intro__title">
          A spotter that watches
          <br />
          every rep.
        </h1>
        <p className="intro__lede">
          FormFit AI tracks your joints through a webcam, counts reps on its
          own, and calls out dangerous form the moment it happens — not in a
          summary screen after the set is already done.
        </p>
        <button type="button" className="intro__cta" onClick={onEnter}>
          Open the dashboard
        </button>
        <dl className="intro__facts">
          <div>
            <dt>Hardware</dt>
            <dd>Just a webcam</dd>
          </div>
          <div>
            <dt>Feedback</dt>
            <dd>Real-time, mid-set</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>None</dd>
          </div>
        </dl>
      </div>
      <div className="intro__figure">
        <SquatFigure animated size={220} />
      </div>
    </div>
  );
}

export default IntroPage;
