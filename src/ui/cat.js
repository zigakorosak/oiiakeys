// The cat, as inline SVG (drawn here, not the meme's photo). The keyboard
// screen spins it around its vertical axis while notes are sounding.

const SVG_NS = "http://www.w3.org/2000/svg";

const MARKUP = `
  <path class="cat-ear" d="M18 44 L26 8 L48 30 Z"/>
  <path class="cat-ear" d="M102 44 L94 8 L72 30 Z"/>
  <path class="cat-ear-inner" d="M24 38 L29 17 L42 31 Z"/>
  <path class="cat-ear-inner" d="M96 38 L91 17 L78 31 Z"/>
  <ellipse class="cat-head" cx="60" cy="60" rx="46" ry="40"/>
  <path class="cat-stripe" d="M52 22 Q60 30 68 22 L66 34 Q60 38 54 34 Z"/>
  <ellipse class="cat-muzzle" cx="60" cy="74" rx="22" ry="16"/>
  <ellipse class="cat-eye" cx="42" cy="56" rx="7" ry="9"/>
  <ellipse class="cat-eye" cx="78" cy="56" rx="7" ry="9"/>
  <circle class="cat-glint" cx="44" cy="53" r="2.2"/>
  <circle class="cat-glint" cx="80" cy="53" r="2.2"/>
  <path class="cat-nose" d="M55 66 L65 66 L60 72 Z"/>
  <ellipse class="cat-mouth" cx="60" cy="81" rx="5" ry="6"/>
  <path class="cat-whisker" d="M36 72 L10 66 M36 77 L10 79 M84 72 L110 66 M84 77 L110 79"/>
`;

export function catFace() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 120 108");
  svg.setAttribute("class", "cat");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = MARKUP;
  return svg;
}
