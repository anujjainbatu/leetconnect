// config.js
export const API_BASE = "http://localhost:8000";
export let JWT = null;

// Helper to load/save JWT
export function loadToken() {
  chrome.storage.local.get("jwt", ({ jwt }) => { JWT = jwt || null; });
}
export function saveToken(token) {
  JWT = token;
  chrome.storage.local.set({ jwt: token });
}
