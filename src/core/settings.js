// Persistent, app-wide preferences. Backed by localStorage; falls back to
// defaults when storage is unavailable (private browsing) or holds
// unexpected data. Same shape as GeoQuiz's core/settings.js.

const STORAGE_KEY = "oiia-keys-settings";

const defaults = {
  // Show the computer key that plays each piano key.
  showKeyLabels: true,
  // Show note names (C4, F♯4, …) on the keys.
  showNoteNames: false,
  // Lowest C on screen.
  octave: 4,
};

export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable — the setting just won't survive a reload.
  }
}
