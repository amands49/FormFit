import { scoreBand } from "../stats";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_X = 24;
const PAD_Y = 20;

const BAND_COLOR = {
  clean: "var(--plate-green)",
  caution: "var(--plate-yellow)",
  fault: "var(--plate-red)",
};

function xFor(i, count) {
  if (count <= 1) return WIDTH / 2;
  return PAD_X + (i / (count - 1)) * (WIDTH - PAD_X * 2);
}

function yFor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  return HEIGHT - PAD_Y - (clamped / 100) * (HEIGHT - PAD_Y * 2);
}

function shortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ProgressChart({ sessions }) {
  if (sessions.length === 0) {
    return (
      <div className="chart chart--empty">
        <span>Form-score trend appears once a set is logged.</span>
      </div>
    );
  }

  const points = sessions.map((s, i) => ({
    x: xFor(i, sessions.length),
    y: yFor(s.form_score),
    score: s.form_score,
    date: s.created_at,
    band: scoreBand(s.form_score),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${HEIGHT - PAD_Y} L ${points[0].x.toFixed(1)} ${HEIGHT - PAD_Y} Z`;

  const labelIdx = sessions.length === 1
    ? [0]
    : [...new Set([0, Math.floor((sessions.length - 1) / 2), sessions.length - 1])];

  return (
    <div className="chart">
      <div className="chart__head">
        <span className="chart__title">Form score across sessions</span>
        <ul className="chart__legend">
          <li><span className="dot dot--clean" /> 90+ clean</li>
          <li><span className="dot dot--caution" /> 75–89 caution</li>
          <li><span className="dot dot--fault" /> under 75</li>
        </ul>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="chart__svg"
        role="img"
        aria-label="Line chart of form score over logged sessions"
      >
        {[0, 50, 100].map((v) => (
          <line
            key={v}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={yFor(v)}
            y2={yFor(v)}
            className="chart__gridline"
          />
        ))}
        <path d={areaPath} className="chart__area" />
        <path d={linePath} className="chart__line" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={BAND_COLOR[p.band]}
            stroke="var(--chalk)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="chart__xlabels">
        {labelIdx.map((i) => (
          <span key={i} style={{ left: `${(points[i].x / WIDTH) * 100}%` }}>
            {shortDate(points[i].date)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ProgressChart;
