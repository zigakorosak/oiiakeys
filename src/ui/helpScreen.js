// How to play: short sections on how the keyboard works. Keep in step
// with features (README "Features").

import { h } from "./dom.js";

const sections = [
  {
    title: "Playing",
    text: "Each new key sings the next sound of “o-i-a”, round and round. Pressing the same key again repeats its sound; holding a key holds the sound. Slide across the keys to glide; chords work too.",
  },
  {
    title: "Computer keyboard",
    text: "The home row (A S D F G H J K L ;) plays the white keys and the row above (W E T Y U O P) the black ones, like a piano. Z and X move down and up an octave.",
  },
  {
    title: "Settings",
    text: "Show or hide key letters and note names.",
  },
];

export function renderHelp(root, navigate) {
  root.append(
    h(
      "div.menu-screen.wizard-screen",
      {},
      h("button.wizard-back", { type: "button", onclick: () => navigate("home") }, "← Back"),
      h("h1", {}, "How to play"),
      sections.map(({ title, text }) =>
        h("section.help-section", {}, h("h2", {}, title), h("p", {}, text)),
      ),
    ),
  );
}
