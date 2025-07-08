// config.js
export const API_BASE = "http://localhost:8000";
export let JWT = null;

// Helpers to load/save JWT
export function loadToken(callback) {
  // Try Chrome storage first
  if (chrome?.storage?.local) {
    chrome.storage.local.get("jwt", ({ jwt }) => {
      JWT = jwt || null;
      if (callback) callback();
    });
  } else {
    // Fallback to localStorage
    const token = localStorage.getItem("jwt");
    JWT = token || null;
    if (callback) callback();
  }
}

export function saveToken(token) {
  JWT = token;
  if (token) {
    localStorage.setItem("jwt", token);
    chrome?.storage?.local?.set({ jwt: token });
  } else {
    localStorage.removeItem("jwt");
    chrome?.storage?.local?.remove("jwt");
  }
}


// Utility for authorized fetch
export async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  if (JWT) headers["Authorization"] = `Bearer ${JWT}`;
  headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
