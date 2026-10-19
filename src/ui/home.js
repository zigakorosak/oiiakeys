// Main hub: Play / How to play / Settings.

import { choiceScreen } from "./screenKit.js";
import { catFace } from "./cat.js";
import { h } from "./dom.js";

export function renderHome(root, navigate) {
  const screen = choiceScreen(root, {
    title: "OIIA Keys",
    subtitle: "A keyboard where every note is the spinning cat.",
    options: [
      { label: "Play", onSelect: () => navigate("keyboard") },
      { label: "How to play", onSelect: () => navigate("help") },
      { label: "Settings", onSelect: () => navigate("settings") },
    ],
  });
  screen.querySelector("h1").before(h("div.home-cat", {}, catFace()));
}
