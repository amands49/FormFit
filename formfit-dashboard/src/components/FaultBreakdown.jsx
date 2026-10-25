import { formatWarningTag } from "../api";

function FaultBreakdown({ faults }) {
  if (faults.length === 0) {
    return (
      <section className="panel" aria-label="Recurring form faults">
        <h2 className="panel__title">Recurring faults</h2>
        <p className="panel__empty">
          No faults flagged yet — every logged rep has stayed within safe
          angle ranges.
        </p>
      </section>
    );
  }

  const max = faults[0].count;

  return (
    <section className="panel" aria-label="Recurring form faults">
      <h2 className="panel__title">Recurring faults</h2>
      <ul className="faults">
        {faults.slice(0, 6).map(({ tag, count }) => (
          <li key={tag} className="faults__row">
            <span className="faults__label">{formatWarningTag(tag)}</span>
            <span className="faults__bar-track">
              <span
                className="faults__bar"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="faults__count">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FaultBreakdown;
