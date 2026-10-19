# Project Log

Newest first. What changed and why.

## 2026-10-19: Cycle is o-i-a

User correction: the cycle should go o i a o i a, not o i i a. Dropped
the second "i" from `VOWEL_SEQUENCE`. Checked in headless Firefox:
`a s d f g g h a` sings o i a o i i a o.

## 2026-10-19: One vowel per press, held while the key is

User request: each press should cycle between o, i and a, unless it's
the same key, which repeats the sound; holding should give a prolonged
sound.

Each press now sings one vowel, stepping o → i → i → a (the meme's
spelling, so four keys spell "oiia"; read as the user's "o i and a").
The same key as the previous press repeats its vowel. Notes sustain
until released, then fade over 0.12 s. The "oiia" / "oi" setting is
gone (the whole-syllable mode it chose between no longer exists), and
the cat spins while any key is held.

Checked in headless Firefox: `a s d f g g g h a` sang o i i a o o o i i;
a held key stays lit with the cat spinning, and both stop on release; no
console errors. Rendered offline: a 1.0 s hold sounds for 1.0 s then
fades out within 0.2 s, a 0.2 s hold stops after 0.2 s. Release now
fades from a computed level: reading `gain.value` mid-ramp isn't
reliable in Firefox (would click or jump). Still not listened to.

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
