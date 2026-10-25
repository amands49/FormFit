const NAV_ITEMS = [
  { id: "exercises", label: "Exercises" },
  { id: "progress", label: "Progress" },
  { id: "credits", label: "Credits" },
];

function NavIcon({ id }) {
  if (id === "exercises") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5" cy="12" r="2.4" fill="currentColor" />
        <rect x="9" y="10.5" width="6" height="3" rx="0.5" fill="currentColor" />
        <circle cx="19" cy="12" r="2.4" fill="currentColor" />
      </svg>
    );
  }
  if (id === "progress") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 19 V13 M10 19 V8 M16 19 V11 M22 19 V5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M7 21 L9 14 L15 14 L17 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sidebar({ active, onNavigate, score }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <button type="button" className="sidebar__mark" onClick={() => onNavigate("exercises")}>
        <span className="sidebar__plate" aria-hidden="true" />
        <span className="sidebar__title">FormFit AI</span>
      </button>

      <ul className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`sidebar__link ${active === item.id ? "sidebar__link--active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-current={active === item.id ? "page" : undefined}
            >
              <NavIcon id={item.id} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {score !== null && (
        <div className="sidebar__score">
          <span className="sidebar__score-label">Form score</span>
          <span className="sidebar__score-value">{Math.round(score)}</span>
        </div>
      )}
    </nav>
  );
}

export default Sidebar;
