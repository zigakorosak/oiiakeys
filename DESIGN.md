# OIIA Keys — Design Document

## Goal

A browser keyboard where the notes sound like the "oiia" spinning-cat
meme: each press sings the next sound of o-i-a at that key's pitch,
held as long as the key is, while the cat spins. Small,
fast to load, works with mouse, touch and the computer keyboard.

## Tech stack

- Vanilla JavaScript (ES modules), no UI framework.
- [Vite](https://vite.dev/) for the dev server and build.
- Web Audio API for the voice (no samples, no audio library).
- No backend. Fully static; `base: "/oiiakeys/"` in `vite.config.js`.
- Playwright + Firefox (devDependency) for browser-driven checks.

## Architecture

Same layout and screen router as GeoQuiz / Anatomy Quiz (`reference/`).

```
src/
  core/
    notes.js        — on-screen keys per octave, KeyboardEvent.code mapping, key labels, midi → Hz
    settings.js     — persistent preferences (localStorage), GeoQuiz's settings.js
  audio/
    oiiaVoice.js    — formant synthesizer: one sustained vowel (o, i or a) per note
  ui/
    dom.js          — h() element helper (copied from Anatomy Quiz)
    screenKit.js    — shared full-screen "pick one of these" component
    home.js         — Play / How to play / Settings
    keyboard.js     — the play screen: stage with the cat, piano keys, input handling
    cat.js          — the cat as inline SVG
    settingsScreen.js — one section per preference, saved on click
    helpScreen.js   — How to play (keep in step with features)
  main.js           — top-level screen router; screens may return a cleanup function
```

### Voice (`audio/oiiaVoice.js`)

Synthesized, so there's no meme audio file to license or ship. Classic
source–filter vowel synthesis:

- **Source**: a sawtooth at the note's frequency. It scoops up from −1
  semitone over 60 ms, and a 6 Hz vibrato of ±1.2% fades in after 0.15 s.
- **Filter**: three parallel band-pass filters at the vowel's formants
  F1–F3 (gains 1, 0.6, 0.3; bandwidths 80/100/140 Hz). Adult formant
  values for o, i, a, scaled ×1.25 for a smaller, cattier vocal tract.
- **One vowel per press**, sustained until `stop()`: 20 ms attack, then
  held; `stop()` fades out over 0.12 s. The fade starts from a level
  computed from the attack's progress, not read from `gain.value`, which
  Firefox doesn't update during scheduled ramps.
- **Vowel loudness**: narrow formants pass fewer of the sawtooth's
  harmonics on "o" and "a" than on "i", so those were ~2× quieter. Each
  vowel's level is `VOWEL_LEVEL` (o 2.2, i 1, a 1.8).
- **Output**: master gain 0.35 → a compressor (−12 dB, 8:1) so chords
  don't clip.
- The AudioContext is created on the first note (it must be in a user
  gesture) and shared across screens.

### Vowel cycle (`ui/keyboard.js`)

Presses step through `VOWEL_SEQUENCE` = o, i, a, then start over,
shared by all inputs. A press on the same
key as the previous press repeats that vowel instead of stepping on.
A glide counts each new key as a press. The cycle starts at "o" each
time the play screen opens.

### Keyboard (`ui/keyboard.js`, `core/notes.js`)

- 17 keys from C of the current octave (default 4, range 1–6, saved).
- White keys are flex children; black keys are absolutely positioned on
  the line between two white keys (`left` set in JS, centred by
  `translateX(-50%)`).
- **Held state** is a map from source (`pointer:<id>` or a key code) to
  the note it holds and that note's `stop()`, so multi-touch, chords and mixed mouse+keys all
  light up correctly. Window blur releases everything (no keyup comes
  after alt-tab).
- **Pointer**: capture on the keyboard; on move, `elementFromPoint` finds
  the key under the pointer and a new key sings (glide). `touch-action:
  none` on the keyboard.
- **Computer keys** by `KeyboardEvent.code` (physical position). Labels
  come from `navigator.keyboard.getLayoutMap()` where available
  (Chromium); Firefox falls back to QWERTY letters.
- **Cat**: spins (`rotateY`, 0.45 s per turn) while any key is held; the mouth opens while spinning.
  `prefers-reduced-motion` turns the spin off.

## Possible next steps

- Sample mode: drop in a recorded "oiia" and pitch-shift it per note
  (`playbackRate`), as an alternative to the synth.
- Record and play back a tune; a few preset songs.

## Project conventions

- **Docs**: four markdown files, each with one job: this one
  (design/overview), `LOG.md` (chronological history), `MISTAKES.md`
  (process lessons, read before a debugging round), `README.md`
  (outward-facing intro). Don't add further `.md` files.
- **Archiving**: after a significant change, run `npm run archive --
  <short-label>`. It excludes `node_modules`, `dist`, `archive` and
  `reference`, and keeps the 10 most recent snapshots.
- **Release scripts**: `scripts/git-push.sh "msg"` stages everything,
  refuses credential-looking paths, commits and pushes. `scripts/deploy.sh`
  triggers the manual deploy workflow and waits for pass/fail.
  `scripts/push-deploy.sh "msg"` runs both, and
  `scripts/archive-p-d.sh <label> "msg"` archives first.
- **Scratch scripts**: `scratch-*.mjs` in the project root (gitignored),
  deleted in the same turn they're finished with.

## Deployment

Target: `zigakorosak.com/oiiakeys/` on Namecheap shared hosting (cPanel),
the same host as GeoQuiz and Anatomy Quiz. `.github/workflows/deploy.yml`
builds on GitHub's runner and FTPS-uploads `dist/`. It is **manual only**
(`workflow_dispatch`).

`vite.config.js` sets `base: "/oiiakeys/"`. If the deploy path changes,
that line must change to match.

**One-time setup:**

1. ~~Create the GitHub repo and push.~~ Done 2026-10-19:
   `github.com/zigakorosak/oiiakeys`.
2. cPanel FTP account (e.g. `ftpaccoiiakeys@zigakorosak.com`), scoped to
   `public_html/oiiakeys`. **Not done yet.**
3. Repo secrets `FTP_SERVER` (`zigakorosak.com`), `FTP_USERNAME`,
   `FTP_PASSWORD`. **Not done yet.**

Gotchas from GeoQuiz's setup:

- Use the bare domain `zigakorosak.com` for `FTP_SERVER`. The
  `ftp.zigakorosak.com` that cPanel suggests doesn't resolve (NXDOMAIN).
- `server-dir` is relative to the FTP account's own login root. With an
  account scoped to `public_html/oiiakeys`, it must be `./`, or the app
  ends up nested inside itself.
- Pin `SamKirkland/FTP-Deploy-Action@v4.4.0`. There is no `@v4` tag.
- Secrets are write-only. The only way to check them is a deploy run.

## Environment notes

- Node 26, npm 12, `gh` (authenticated as zigakorosak), `git`,
  `python3` (no numpy: do audio analysis in Node). Firefox is the user's
  browser. Playwright's Firefox runs headless here.
- Audio can be checked without speakers: in Playwright, replace
  `window.AudioContext` with an `OfflineAudioContext` subclass via
  `addInitScript`, press a key, `startRendering()`, and analyse or save
  the samples as WAV.
