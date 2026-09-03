# Local patches to vendored dependencies

Anything in `vendor/` is third-party and would normally be replaced wholesale on
an upgrade. These changes would be lost, so they are listed here. Re-apply them
after any reveal.js update.

## `reveal/plugin/notes/notes.js`

**AIT: planned window in the speaker view** (2026-09-03).

Reveal's speaker view shows a running timer, which answers *how long have I been
talking*. The useful question is *should I still be on this slide*, which needs a
wall-clock window per slide computed from the moment the lesson actually started.

`widgets/theory-widgets.js` computes that window and injects it as a
`.plan-line` at the top of every slide's `aside.notes`, so no patch is needed for
it to reach the speaker view at all. The patch only **moves** it: three additions,
all marked `AIT:` in the file.

1. A `.ait-plan` block inside `.speaker-controls-time`, right under the clock.
2. CSS for it, and `.speaker-controls-notes .plan-line { display: none }`.
3. `aitLiftPlan()`, called after `notesValue.innerHTML` is set: it moves the
   `.plan-line` out of the notes body into the panel, and hides the panel on
   slides that have no plan line.

Without the patch nothing breaks — the window simply appears as the first line
of the notes instead of next to the clock.
