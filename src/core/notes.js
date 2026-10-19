// The keyboard's notes and the computer keys that play them.
//
// Keys are matched by `KeyboardEvent.code` (the physical key), not `key`,
// so the piano layout stays the same shape on QWERTY, QWERTZ and AZERTY.
// The labels shown on the keys come from `keyLabels()` below.

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const BLACK = new Set([1, 3, 6, 8, 10]);

// Home row = white keys, row above = black keys, the usual DAW layout.
// Index = semitones above the lowest C on screen.
export const KEY_CODES = [
  "KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF", "KeyT", "KeyG", "KeyY",
  "KeyH", "KeyU", "KeyJ", "KeyK", "KeyO", "KeyL", "KeyP", "Semicolon",
];

export const OCTAVE_DOWN = "KeyZ";
export const OCTAVE_UP = "KeyX";
export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 6;

// QWERTY labels, used when the browser can't report the real layout.
const FALLBACK_LABELS = {
  KeyA: "A", KeyW: "W", KeyS: "S", KeyE: "E", KeyD: "D", KeyF: "F", KeyT: "T",
  KeyG: "G", KeyY: "Y", KeyH: "H", KeyU: "U", KeyJ: "J", KeyK: "K", KeyO: "O",
  KeyL: "L", KeyP: "P", Semicolon: ";", KeyZ: "Z", KeyX: "X",
};

/** MIDI note number → frequency in Hz (A4 = 69 = 440 Hz). */
export const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** The on-screen keys for a keyboard whose lowest C is in `octave`. */
export function keysFor(octave) {
  const base = 12 * (octave + 1); // MIDI number of that C
  return KEY_CODES.map((code, i) => {
    const midi = base + i;
    return {
      midi,
      code,
      name: `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`,
      black: BLACK.has(midi % 12),
    };
  });
}

/**
 * code → printed character for the user's layout. Chromium exposes it via
 * navigator.keyboard.getLayoutMap(); Firefox doesn't, so it falls back to
 * QWERTY (on QWERTZ the "Y" key then reads "Y" but sits where Z is).
 */
export async function keyLabels() {
  try {
    const map = await navigator.keyboard?.getLayoutMap?.();
    if (map) {
      const labels = {};
      for (const code of Object.keys(FALLBACK_LABELS)) {
        labels[code] = (map.get(code) ?? FALLBACK_LABELS[code]).toUpperCase();
      }
      return labels;
    }
  } catch {
    // Not allowed here (e.g. in an iframe) — use the fallback.
  }
  return { ...FALLBACK_LABELS };
}
