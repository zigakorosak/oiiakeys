# OIIA Keys

A browser keyboard where every note is the spinning cat: each key press
sings the next sound of "o-i-a" at that pitch, while the cat spins.

Planned for [zigakorosak.com/oiiakeys](https://zigakorosak.com/oiiakeys/)
(not deployed yet, see "Deployment").

## Features

- A 17-key piano (C to E, an octave and a third), playable by mouse,
  touch, or the computer keyboard. Chords work; slide across the keys to
  glide.
- **Presses cycle o → i → a**, round and round. Pressing
  the same key again repeats its sound. Holding a key holds the sound.
  Synthesized live (no audio files).
- The cat spins (and opens its mouth) while any key is held; each press
  sends its letter floating up from where its key is.
- **Computer keyboard**: home row = white keys, row above = black keys,
  Z / X = octave down / up (octaves 1–6). Matched by physical key, so the
  shape is the same on QWERTY, QWERTZ and AZERTY.
- **Settings**: key letters on/off, note names on/off. Saved in the
  browser.
- **How to play** page on the home screen.

## Tech stack

Vanilla JavaScript (ES modules), no UI framework. [Vite](https://vite.dev/)
for the dev server and build. Web Audio API for the voice. No backend,
no dependencies at runtime: fully static.

## Getting started

```bash
npm install
npm run dev       # dev server at http://localhost:5173/oiiakeys/
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

### Archiving a snapshot

```bash
npm run archive -- <short-label>
```

Tars the project (excluding `node_modules`, `dist`, `archive`, `reference`)
into `archive/<timestamp>_<label>.tar.gz`, keeping the 10 most recent.

## Deployment

Deploys are **manual only**. Pushing to `main` does not trigger anything.

```bash
gh workflow run "Deploy to Namecheap"   # or scripts/deploy.sh, which also waits for the result
```

The workflow (`.github/workflows/deploy.yml`) builds the site and
FTPS-uploads `dist/` to Namecheap shared hosting at
`zigakorosak.com/oiiakeys/`. It needs the FTP account and repo secrets
listed in `DESIGN.md` "Deployment" first.

## Project structure

```
src/
  core/       — notes and key mapping, persistent settings
  audio/      — the "oiia" formant synthesizer
  ui/         — screens: home, keyboard, settings, how to play; the cat
  main.js     — top-level screen router
public/       — favicon
scripts/      — archive and release scripts
reference/    — sibling projects this one is modelled on (local only, gitignored)
```

## Docs conventions

Four markdown files, each with one job: this README (outward-facing intro),
`DESIGN.md` (architecture), `LOG.md` (chronological change history), and
`MISTAKES.md` (process lessons). Don't add further `.md` files; extend these.
