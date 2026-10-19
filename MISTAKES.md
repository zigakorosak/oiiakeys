# Mistakes & Lessons

A working reference for the assistant. `DESIGN.md` says what the code is,
`LOG.md` says what changed and why, and this file says **what went wrong
while getting there**, so the same time and tokens aren't spent twice.

Read this before a debugging round. Add to it whenever something takes
more than one attempt.

The lessons below are carried over from GeoQuiz and Anatomy Quiz
(`reference/*/MISTAKES.md` has the full stories): the ones that transfer
to any project.

---

## The single biggest lesson

**A bug reported twice means the theory is wrong. Stop theorizing and go
measure.** The second time a symptom is re-reported, the next action is
building observation tooling, not another fix.

## Verification playbook

- **Drive a real browser for anything about input.** jsdom has no
  geometric hit-testing, so its click tests can't fail for the bugs that
  matter. Playwright works here.
- **Test in Firefox.** It's the user's only browser.
- **Measure audio, don't assume it.** Render offline (DESIGN.md
  "Environment notes") and check pitch and loudness over time. Then say
  plainly that nobody has listened to it yet.
- **Measure incrementally**: change one input at a time and print the
  metric.
- **Check a control**: when changing shared code, verify the unaffected
  path is unchanged.

## Recurring mistake patterns

1. **Asserting instead of computing.** If a fix depends on a CSS
   specificity, inheritance, or precedence claim, compute it. After
   wiring a listener, verify the element can actually receive the event.
2. **`stopPropagation()` is a cross-module change.** Grep for root or
   delegated listeners that depend on the event first.
3. **Thresholds calibrated at one viewport size.** Test at 3 or more
   sizes, including portrait.
4. **Overclaiming in docs.** Write what was verified, not how confident
   it felt.

## Environment gotchas

- **Never `pkill -f` with a pattern from your own command line**: the
  shell running it matches too and gets killed. Match on argv fields:
  `ps -eo pid,args | awk '$2=="node" && $3=="scratch-x.mjs" {print $1}'`.
- **The `hidden` attribute loses to any class that sets `display`.** Keep
  the global `[hidden] { display: none !important }` in style.css.
- **`el.replaceChildren(a, null, b)` renders the text "null".** Use `h()`
  or filter the arguments first.
- **"Off" switches in a DOM helper.** A helper that skips `false` props
  silently drops `spellcheck: false` and similar.
- **Heredoc delimiters must match.** Put multi-line edits in a file,
  then run the file.
- **Screenshots right after a click can catch a CSS transition mid-way.**
  Wait it out before judging colours.

## Project-specific traps

- **Absolutely positioned children measure `left: %` against the padding
  box**, not the content box the flex siblings live in. The black keys
  are offset by `.keyboard`'s side padding for this reason.
- **Playwright `getByText("Play")` also matches "How to play".** Use
  `getByRole("button", { name: "Play", exact: true })`.
