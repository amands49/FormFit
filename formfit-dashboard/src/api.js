const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** GET /sessions — every logged set, newest first. */
export function fetchSessions() {
  return request("/sessions");
}

/** GET /sessions/:id — a single session, if ever needed for a detail view. */
export function fetchSession(id) {
  return request(`/sessions/${id}`);
}

/** POST /sessions — submit a completed live-session summary, same shape the desktop CV engine sends. */
export async function postSession(summary) {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(summary),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** "forward_lean" -> "Forward lean". Warnings are stored as raw fault tags. */
export function formatWarningTag(tag) {
  return tag.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

export { API_URL };
