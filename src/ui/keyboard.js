// The play screen: the cat on top, a piano keyboard underneath. Keys are
// played by mouse/touch (with glides across the keys) or by the computer
// keyboard (core/notes.js has the mapping).

import {
  keysFor,
  keyLabels,
  frequency,
  OCTAVE_DOWN,
  OCTAVE_UP,
  MIN_OCTAVE,
  MAX_OCTAVE,
} from "../core/notes.js";
import { loadSettings, saveSettings } from "../core/settings.js";
import { createVoice, VOWEL_SEQUENCE } from "../audio/oiiaVoice.js";
import { catFace } from "./cat.js";
import { h } from "./dom.js";

// One voice for the whole app, so the AudioContext survives screen changes.
const voice = createVoice();

export function renderKeyboard(root, navigate) {
  const settings = loadSettings();
  let labels = null;
  let keyEls = new Map(); // midi → key element
  let keys = [];

  const cat = h("div.stage-cat", {}, catFace());
  const stage = h("div.stage", {}, cat);
  const keyboard = h("div.keyboard", { role: "group", "aria-label": "Piano keyboard" });
  const octaveLabel = h("span.octave-label", { "aria-live": "polite" });
  const octaveDown = h("button.octave-button", { type: "button", "aria-label": "Octave down" }, "−");
  const octaveUp = h("button.octave-button", { type: "button", "aria-label": "Octave up" }, "+");

  root.append(
    h(
      "div.play-screen",
      {},
      h(
        "header.play-header",
        {},
        h("button.wizard-back", { type: "button", onclick: () => navigate("home") }, "← Home"),
        h("div.octave-control", {}, octaveDown, octaveLabel, octaveUp),
      ),
      stage,
      keyboard,
    ),
  );

  // ---------- Building the keys ----------

  function build() {
    keys = keysFor(settings.octave);
    keyEls = new Map();
    const whites = keys.filter((k) => !k.black).length;
    let whiteIndex = 0;
    const children = keys.map((key) => {
      const label = settings.showKeyLabels && labels ? labels[key.code] : null;
      const el = h(
        key.black ? "div.key.key--black" : "div.key.key--white",
        { dataset: { midi: key.midi }, "aria-label": key.name },
        settings.showNoteNames ? h("span.key-note", {}, key.name) : null,
        label ? h("span.key-letter", {}, label) : null,
      );
      if (key.black) {
        // Centred on the line between the previous white key and the next.
        el.style.left = `calc(0.5rem + (100% - 1rem) * ${whiteIndex / whites})`;
      } else {
        whiteIndex++;
      }
      keyEls.set(key.midi, el);
      return el;
    });
    keyboard.style.setProperty("--whites", whites);
    keyboard.replaceChildren(...children);
    octaveLabel.textContent = `C${settings.octave}`;
    octaveDown.disabled = settings.octave <= MIN_OCTAVE;
    octaveUp.disabled = settings.octave >= MAX_OCTAVE;
  }

  function shiftOctave(delta) {
    const next = Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, settings.octave + delta));
    if (next === settings.octave) return;
    releaseAll();
    settings.octave = next;
    saveSettings(settings);
    build();
  }
  octaveDown.addEventListener("click", () => shiftOctave(-1));
  octaveUp.addEventListener("click", () => shiftOctave(1));

  // ---------- Sounding a note ----------

  // Held keys, by source ("pointer:<id>" or a key code) → { midi, stop },
  // so a key sounds and lights up exactly while something is holding it.
  const held = new Map();

  // Each press sings the next vowel of o-i-a, except pressing the same
  // key as last time, which repeats its vowel.
  let step = -1;
  let lastMidi = null;
  function nextVowel(midi) {
    if (midi !== lastMidi) step = (step + 1) % VOWEL_SEQUENCE.length;
    lastMidi = midi;
    return VOWEL_SEQUENCE[step];
  }

  function refreshHeld() {
    const down = new Set([...held.values()].map((note) => note.midi));
    for (const [midi, el] of keyEls) el.classList.toggle("key--down", down.has(midi));
    // The cat spins while anything is being sung.
    cat.classList.toggle("stage-cat--spinning", held.size > 0);
  }

  function press(source, midi) {
    if (held.get(source)?.midi === midi) return;
    held.get(source)?.stop();
    const vowel = nextVowel(midi);
    held.set(source, { midi, stop: voice.start(frequency(midi), vowel) });
    refreshHeld();
    floatWord(keys.find((k) => k.midi === midi), vowel);
  }

  function release(source) {
    const note = held.get(source);
    if (!note) return;
    note.stop();
    held.delete(source);
    refreshHeld();
  }

  function releaseAll() {
    for (const note of held.values()) note.stop();
    held.clear();
    refreshHeld();
  }

  // The sung vowel, floating up above roughly where its key is.
  function floatWord(key, vowel) {
    const index = keys.indexOf(key);
    const word = h("span.float-word", {}, vowel);
    word.style.left = `${8 + (index / (keys.length - 1)) * 84}%`;
    word.addEventListener("animationend", () => word.remove());
    stage.append(word);
  }

  // ---------- Mouse / touch ----------

  const keyAt = (x, y) => document.elementFromPoint(x, y)?.closest(".key");

  keyboard.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".key");
    if (!el) return;
    e.preventDefault();
    keyboard.setPointerCapture(e.pointerId);
    press(`pointer:${e.pointerId}`, Number(el.dataset.midi));
  });
  keyboard.addEventListener("pointermove", (e) => {
    const source = `pointer:${e.pointerId}`;
    if (!held.has(source)) return;
    const el = keyAt(e.clientX, e.clientY);
    if (el && keyboard.contains(el)) press(source, Number(el.dataset.midi));
    else release(source);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    keyboard.addEventListener(type, (e) => release(`pointer:${e.pointerId}`));
  }

  // ---------- Computer keyboard ----------

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === OCTAVE_DOWN || e.code === OCTAVE_UP) {
      e.preventDefault();
      if (!e.repeat) shiftOctave(e.code === OCTAVE_UP ? 1 : -1);
      return;
    }
    const key = keys.find((k) => k.code === e.code);
    if (!key) return;
    e.preventDefault();
    if (!e.repeat) press(e.code, key.midi);
  }
  const onKeyUp = (e) => release(e.code);
  // Alt-tabbing away mid-press never delivers the keyup.
  const onBlur = () => releaseAll();

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  build();
  keyLabels().then((l) => {
    labels = l;
    build();
  });

  return () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    releaseAll();
  };
}
