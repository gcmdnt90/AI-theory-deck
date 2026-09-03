---
title: Module renames — the cut point for the questionnaire data
status: recorded, forms deliberately NOT changed
date: 2026-09-03
---

# Module renames, 2026-09-03

Two of the five SME modules were renamed, because their titles overlapped with
the modules on either side and the speaker kept re-explaining the same idea in
three places. Rationale: `delivery/REVISION-2026-09-03.md`.

| # | until 2026-09-02 | from 2026-09-03 |
|---|---|---|
| M1 | Come la macchina fabbrica le parole | *unchanged* |
| M2 | Dentro il modello, intorno al modello | **Dentro il modello** |
| M3 | Contesto, memoria, grounding | **Da dove prende quello che non sa** |
| M4 | Dalle istruzioni agli strumenti | *unchanged* |
| M5 | Rischi e giudizio | *unchanged* |

English mirror: *Inside the model* and *Where it gets what it does not know*.

## What moved, not just what was renamed

- «Tre livelli, una macchina» (was M1) and «Il confine» (was M2 opener) were the
  same claim twice. They are now **one slide at the head of M2**.
- «Un agente = modello + ciclo + strumenti + memoria» moved **M2 → M4**, merged
  into «Chatbot e sistema agentico», which used to refer back to it.
- «Tre modi per non ricominciare da zero» (M3) was **deleted**: two of its three
  cards were signposts to other slides. Its one real fact — auto-summarisation
  is lossy and silent — is now a bullet on «Il problema del contesto».

Net: −2 content slides, −6 minutes of theory, redistributed to M5 (+2), the
break (+1) and the closing (+1). Deck still totals 120 minutes; the break still
falls at minute 51.

## Effect on the instruments — read before analysing any pooled data

**Concept Test: unaffected.** The 12 items are keyed by id (`gen, train, temp,
around, embed, retrieve, rules, verify, halluc, data, inject, vigil`), not by
module title, and no item's concept crossed a module boundary:

- `train` and `around` are M2 items. The fused levels/boundary slide stayed in
  M2, so `around` is still taught where it is measured.
- `embed` and `retrieve` are M3 items and live on the context-window and
  retrieval slides, both still in M3.
- `rules` and `verify` are M4 items and did not depend on the deleted slide.

**Self-efficacy scale: two labels drift.** The 7 items are generated from the
modules' `<h1>` (`research/instruments/tests/source/items.py`), so items 2 and 3
name the old titles for sessions run before this date and would name the new
ones after a regeneration.

**Decision (2026-09-03): the three live forms were NOT edited.** Editing a live
Google Form mid-collection silently pools two wordings under one column header,
which is worse than a label that lags the deck by one lesson. Regenerate after
the current round of first lessons and treat **2026-09-03** as the cut point:

```
cd research/instruments/tests/source && python3 gen.py ..
```

Until then, sessions are comparable on the Concept Test and on the Q4TE; the
two renamed self-efficacy items should be reported with their wording as
administered.
