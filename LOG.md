# Project Log

Newest first. What changed and why.

## 2026-10-19: Project set up

User request: read the reference projects (GeoQuiz and Anatomy Quiz, in
`reference/`) for the project structure, set this one up the same way,
make a GitHub repo. The app: a keyboard whose notes sound like the oiia
cat meme.

Set up with the references' structure: Vite + vanilla JS, the screen
router, `dom.js` / `screenKit.js` copied over, the same dark palette and
menu screens, the four docs, the archive/push/deploy scripts and a
manual Namecheap deploy workflow. Repo: `github.com/zigakorosak/oiiakeys`
(public, like the other two). The FTP account and secrets aren't set up,
so it isn't deployed.

The app: home (Play / How to play / Settings), a play screen with a
spinning SVG cat and a 17-key piano, and a formant-synthesized "oiia"
per note (DESIGN.md "Voice").

Checked in headless Firefox (Playwright): computer keys light the right
notes (A → C4, E → D♯4) and release on keyup; a mouse glide across the
white keys sang C4…E5 in order; a black key click gives C♯4; Z / X move
the octave; no page scroll at 390 px wide; no console errors. Rendered
A4 offline: the "ii" measures ~437–446 Hz (440 with vibrato); "o" and
"a" were about half as loud as "ii", so per-vowel levels were added and
re-measured even. **Not listened to**: whether it actually sounds like
the meme needs a human ear.
