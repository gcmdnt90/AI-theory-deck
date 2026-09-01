# AI Translator — resuming the SME theory-deck review
We are doing a slide-by-slide revision of the SME theory deck
(`C:\Code_Projects\AI Translator\delivery\theory-deck`). Resume at module 5 —
`05-risks-judgement.html`, the last one.
## Method
For each slide, state its **purpose / knowledge transmitted / narrative position**,
diagnose what is wrong, propose a fix, wait for my confirmation, then write it —
Italian first (`modules/it/*.html`), English mirrored (`modules/*.html`) — and
rebuild with `node build.mjs`. Speaker notes (`<aside class="notes">`) get
rewritten with every slide, not as an afterthought.
## Rules I have already ratified
- No rhetorical takeaways and no unfalsifiable superlatives. Cut a takeaway that
  only repeats what the slide already says.
- Slide text = short lists or titles that cue the speaker and stick with the
  student. Depth goes in the speaker notes.
- Every claim checkable and sourced. Real numbers over adjectives, mechanism over
  metaphor. Tell me when a source is weak — including when a *frozen test item*
  is weak, and teach the defensible version of it. Say what a number is: a
  measurement, a benchmark, or a practitioner's estimate.
- **Impersonal third person** throughout — no "voi", no "your".
- No anthropomorphic framing (I rejected "obedience" for instruction tuning).
- No model version numbers on slides; they age in weeks. Keep them in the notes.
- A slide that only names what the demo already showed should say so and point,
  not re-explain.
## Hard constraints
- Module `<h1>` titles and demo `title_it` are wired word-for-word into the T1
  Google Form (`research/instruments/tests/google-forms/create_forms.gs`).
  For this module: `M5 · Rischi e giudizio — teoria` and
  `M5 · Demo: in locale, avvelenato, e smentito`. Renaming either means editing
  the form too. `<h2>` slide titles are free.
- **M5 is the only module with real Concept Test coverage** — three of the ten
  frozen items land here: Q5.6 (hallucination as structural, concept #5),
  Q5.9 (cloud vs local / GDPR Art. 9, #8), Q5.10 (vigilance and iterative
  interrogation, #9/10). M1 and M3 carry the rest; M4 carries none. So unlike
  M4, this module is constrained by the instrument: a slide that weakens one of
  those three answers is a research problem, not just an editorial one.
  The closing commitment question repeats T1 Q6.1 verbatim.
- The cover timetable must keep totalling **120 minutes**. M5 is currently
  `data-theory="12" data-demo="12"`. Adding time here means taking it from
  another block (`data-theory`/`data-demo` + the visible cell text, both
  languages).
- Do not alter the measured prompt strings in the M1 next-token widget.
## How the deck works now
- **Five modules** since 2026-09-01: old M4 and M5 were merged into M4
  «Dalle istruzioni agli strumenti», and old M6 became M5. Full record in
  `theory-deck/CONTEXT.md` (`[DECIDED 2026-09-01]`) and in `HANDOFF-M4.md`.
- One **sector selector** on slide `#/0/2` (numismatics / photovoltaic monitoring /
  industrial-automation software) drives every widget and demo.
- **Demo prompts are finished sentences per sector**, in
  `demo-prompts.json → prompts[].variants[<sector>]`. m1–m5 now all have their
  variants, including m5 — the raw `{{PLACEHOLDER}}` era is over.
  `sectors[].client` survives only as an authoring guide.
- A demo can declare a `rungs` array; it renders as numbered cards on the slide
  (`.demo-rungs`) — a projected surface, unlike `lands`/`watch_for`/`note`, which
  are speaker-view only. m3 uses it; m5 does not.
- `[SQUARE BRACKETS]` mark a hole the speaker fills live; they render highlighted.
- Reusable classes: `.corner-media`, `.chain`, `.demo-rungs`, `.signal-card
  card-wide`. Reveal's own selectors beat unprefixed class rules on `ol`/`ul` —
  prefix with `.reveal`. `.prompt-strip` wraps (11 prompts do not fit one row).
- The tokenizer widget is a real cl100k_base BPE; the probability bars are real
  measured logprobs. Neither the container nor the desktop VM can reach the OpenAI
  API — the only route is a `fetch` from a page in my own browser.
- Verify visually before saying a slide is done: build, then bundle `index.html`,
  `css/`, `widgets/`, `vendor/` and the images of the touched slides into a
  `.tgz` under `_to_delete/`, stage it into the container, and screenshot with
  headless Chromium via Playwright
  (`/opt/pw-browsers/chromium/chrome-linux/chrome`; the global playwright lives
  in `/home/claude/.npm-global/lib/node_modules`). Several slides have overflowed
  the viewport after edits. Headless has no H.264 and a wider fallback font, so
  swap `<video>` for an extracted still and treat title-width collisions as
  suspect.
## Demo data
- `delivery/demo-data-kit` generates the demo documents: one config per client,
  deterministic seed. `regole/*.md` is the source of truth, `.pdf` is the
  printable mirror; `lotti/` and `avvelenata/` stay PDF. `_perito/ground-truth.csv`
  is what the M4 table gets checked against in public.
- Only `config/artemide.json` exists. The sector selector promises three sectors,
  so the poisoned folder and the ground-truth check are only truly runnable on
  numismatics. The other two configs need real business facts from Energreen and
  the software house — the kit's README forbids inventing operational detail.
- Client-agnostic run-sheet: `delivery/DEMO-CHECKLIST.md` (§3 "M5 — Local,
  poisoned, and overruled").
## What module 5 is, right now
`modules/it/05-risks-judgement.html` — `<h1>` «Rischi e giudizio», lede «Che cosa
va storto — nel modello, in noi, nei dati». Nine `<section>`s: cover, four
content slides, the demo, then two closing slides.

| # | slide | state |
|---|---|---|
| 1 | `modello` Che cosa sbaglia il modello — allucinazione / distorsione / accondiscendenza | from the 6-module deck, never reviewed |
| 2 | `modello` Frastagliato, non umano | **imported from the old M5 on 2026-09-01**, chip added, notes rewritten — never reviewed in place |
| 3 | `utente` Che cosa succede a noi — erosione / trappola della fluidità / **la domanda entra nella risposta** | third card **added 2026-09-01**, never reviewed |
| 4 | `dati` Dove i dati escono — cloud o locale / prompt injection + the four procurement options | from the 6-module deck, never reviewed |
| 5 | demo `m5` | 12 min, three parts |
| 6 | L'essere umano nel ciclo | never reviewed |
| 7 | Dove siamo arrivati — recap chain + Karpathy quote | **chain mechanically re-cut from 6 steps to 5**, never reviewed |

The demo `m5` «In locale, avvelenato, e smentito», 12 min, Ollama + Cowork +
claude.ai: **A** `m5-p5` the M3 question on a fully local model with the network
physically unplugged · **B** `m5-p1` the poisoned folder — same wording as
`m4-p7`, so the injected document is the only changed variable · **C** `m5-p2`
cold attribution on a genuinely hard image, confident and wrong, dismantled live
by `{{EXPERT_ROLE}}`, then `m5-p3` the disciplined prompt on the same photo.
Library: `m5-p4`, discussion only. Deliberate failure #1 from M1 gets named here.
## Things I already know are worth looking at
Not decisions — starting points. Diagnose them with the method like anything else.
- **Takeaways.** M4 as just finished carries **zero**; M5 carries **six**, the
  most in the deck (M1/M2/M3 carry four each). Either the convention changed
  during M4 and M5 should follow, or M4 is the outlier. Decide it explicitly
  rather than per-slide.
- **The demo sits in the middle of the module**, with two slides after it. Every
  other module ends on its demo, and `create_forms.gs` describes the feedback
  list as being in "lived order". Worth deciding whether that is deliberate
  (the human-in-the-loop slide lands better right after watching the expert
  overrule the model) or an artefact.
- **`watch_for_it` for demo m5 is one sentence** for a three-part, 12-minute
  demo — the thinnest speaker guidance of any demo in the deck. m3 and m4 have
  paragraphs.
- **Slide 2 arrived from another module** and still argues capability, not risk.
  It now sits under the `modello` chip; check that it reads as the fourth
  model-side failure and not as a leftover.
- **Slide 1's "Accondiscendenza" card** is sycophancy — Sharma et al. (2023) is
  cited in the notes but no number is on the slide. Same question as everywhere:
  is the claim carrying a real measurement or an adjective.
- **The four procurement options on slide 4** are the only place the deck gives
  purchasing advice. Check it against the AI Act / GDPR line in the footnote,
  and remember I am not their lawyer.
- **The recap chain** was re-cut 6→5 mechanically. It is the last thing they
  read; it deserves the review the merge did not give it.
## Where we stopped
Done: modules 00, 01, 02, 03 and 04 — every slide plus demos m1, m2, m3 and the
merged m4. Per-sector variants exist for every prompt of every demo.
Next: **module 5 «Rischi e giudizio»** (`05-risks-judgement.html`), then its demo m5.
Still open across the deck: the 2.3 title ("due cose diverse" vs the third thing
its wide card names); verifying the Claude extended-thinking toggle before each
lesson; the two missing `demo-data-kit` sector configs; and re-generating the
two Google Forms — the ones in Drive are from 23 July and predate both taxonomy
revisions, so the T1 feedback list is stale until `createAllForms` is re-run.
`_to_delete/` holds the pre-merge module files and a 20 MB verification bundle;
it can be emptied.

Continuiamo in italiano. Modulo 5.
