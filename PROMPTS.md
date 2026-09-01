# Working with the demo prompt database

**Read this before editing `demo-prompts.json` — humans and AI agents alike.**

The prompts shown on the deck's demo slides are not written in the slides.
They live in `demo-prompts.json` and are inlined into `index.html` by
`build.mjs`. Edit the JSON, run `node build.mjs`, done.

---

## Why it is built this way

1. **One source of truth.** The same prompt appears on the slide, in the
   run-sheet and in the trainer's hand. It cannot drift.
2. **Retargetable.** This deck will be delivered to SMEs other than the
   current client. Adding a `sectors[]` entry re-points every prompt, and the
   demo slides carry a selector to switch between them live.
3. **A database, not a script.** Prompts that worked once are kept, not
   deleted. `status: "library"` keeps them on the slide strip without
   cluttering the live run.
4. **Offline.** The deck must open from `file://` in a room with no
   internet. Nothing is fetched at runtime.

---

## Structure

```
sectors[]      → one SME example per entry. The demo slides show a selector;
                 changing it re-renders every demo slide at once.
  id           stable key, referenced by default_sector and localStorage
  label        what the selector shows (label_it = Italian)
  client       the substitution source for {{PLACEHOLDERS}}
demos[]        → one entry per module demo (m1…m6)
  minutes      feeds the schedule slide's timing
  lands        the concept it teaches      → SPEAKER NOTES ONLY
  watch_for    the tell, or the failure    → SPEAKER NOTES ONLY
  prompts[]    the prompt database for that demo
    id         unique, never reused, never renumbered
    label      what the button says (keep under ~30 chars)
    status     "active"  = used in the live run, shown first
               "library" = kept for reuse, shown after, dashed
    tool       which tool this is typed into
    text       the prompt itself, with {{PLACEHOLDERS}}
    note       trainer conduct note        → SPEAKER NOTES ONLY
```

### The demo slide is a projected surface

Only four things reach the screen: the title, the tools, **the prompt**, and
the way to change it. `lands`, `watch_for` and every prompt `note` are
rendered into `<aside class="notes">` — the speaker view, opened with **S**.

Do not move trainer-facing material onto the slide. The room is looking at
the prompt; the trainer is looking at the notes.

### Italian mirrors

Every human-readable field has an optional `_it` twin: `title_it`,
`label_it`, `text_it`, `note_it`, `lands_it`, `watch_for_it`. The widget
picks the `_it` field when the deck is in Italian and falls back to the
English one when a mirror is missing — so an untranslated field degrades to
readable, not to blank.

Placeholders also mirror: `{{DOMAIN_OBJECT}}` resolves to `DOMAIN_OBJECT_it`
in the Italian deck when that key exists.

**A prompt changed in one language must be changed in both.** The two decks
are compared for research consistency.

## Placeholders

Any key in the selected sector's `client` block can be used as `{{KEY}}`.

| Placeholder | Numismatics sector |
|---|---|
| `{{name}}` | Casa d'Aste Artemide |
| `{{sector}}` | numismatic auction house |
| `{{location}}` | San Marino |
| `{{language}}` | Italian |
| `{{EXPERT_ROLE}}` | the owner, a professional numismatist |
| `{{AUDIENCE}}` | the auction house staff, non-technical |
| `{{DOMAIN_OBJECT}}` / `{{DOMAIN_OBJECT_PL}}` | coin lot / coin lots |
| `{{DOMAIN_ITEM}}` | Roman Republican silver denarius |
| `{{DOC_RULES}}` / `{{DOC_LIST}}` | regolamento di catalogazione / past catalogues |
| `{{QUALITY_FIELD}}` | condition grade |
| `{{REFERENCE_FIELD}}` | catalogue reference |
| `{{FORBIDDEN_OUTPUT}}` | price estimates and automatic attributions |
| `{{FLAG}}` | `[DA VERIFICARE]` |

`{{FLAG}}` stays in the **client's** language even on the English deck: it is
the token their staff will actually type into their own documents. The
illustrative mockup in Module 4 is different — that is teaching material, so
it follows the deck language (`[TO BE VERIFIED]` in English).

`[PASTE ...]` in square brackets marks something the trainer supplies live
from real material. Leave those in place.

## Rules for anyone editing this file

### If you are an AI agent, follow these exactly.

1. **Never invent facts about the client's business.** If a prompt needs a
   detail you do not have — their grading scale, their document names, what
   their staff actually do all day — **stop and ask**. A plausible-sounding
   invented business detail is worse than an empty placeholder, because it
   will be discovered live, in front of the client, by the one person in
   the room who knows it is wrong.

2. **The minimum you need before writing or retargeting a prompt:**
   - what the business sells or produces, and to whom
   - the single document or artefact their staff produce most often
   - who the domain expert in the room is, and what they are expert in
   - one thing the AI must never do in their context (liability, regulatory
     or reputational)
   - whether the demo data is real or synthetic

   Missing any of these → ask. Do not guess, and do not proceed with a
   generic filler prompt hoping it will pass.

3. **Retarget by adding a sector, not by editing prompts.** If a prompt
   cannot survive a sector swap, it is written too specifically. Rewrite it
   with a placeholder rather than hard-coding one client's details.

4. **Never delete a prompt.** Set `status: "library"`. This file is the
   record of what has been tried; deletions destroy that.

5. **Never reuse an `id`.** Ids are referenced by run-sheets and notes.
   New prompt → new id, incrementing within the demo (`m4-p7`, `m4-p8`).

6. **Keep `note` trainer-facing.** It answers "what do I do and what do I
   watch for", not "what this prompt does". It is read at 3 seconds'
   notice, standing up, in front of people.

7. **Preserve the deliberate failures.** `m1-p2`, `m4-p8` and `m5-p1` are
   designed to go wrong. Do not "fix" them. The failure is the lesson —
   see the run-sheet's conduct rules.

8. **Bump `version` and `updated`** on any change.

9. **Always write the Italian mirror.** Add `text_it`, `label_it` and
   `note_it` in the same edit. The two decks are compared for research
   consistency: a change lands in both languages or in neither.

---

## Adding a sector

Copy the numismatics block, keep **every** key, replace only the values:

```jsonc
{
  "id": "machinery",
  "label": "Industrial machinery manufacturer",
  "label_it": "Costruttore di macchinari industriali",
  "client": {
    "DOMAIN_OBJECT": "machine file",
    "DOMAIN_ITEM": "CNC lathe, 2019 build",
    "EXPERT_ROLE": "the service manager",
    "QUALITY_FIELD": "condition class",
    "FORBIDDEN_OUTPUT": "safety certifications and load ratings",
    "FLAG": "[TO BE CHECKED]"
    // …every remaining key from the numismatics block
  }
}
```

A missing key leaves a raw `{{KEY}}` visible on the projected slide. That is
deliberate — a placeholder you can see beats an invented business fact.

Synthetic demo documents for the new sector: see `demo-data/README.md`.

## Adding a demo to a new module

```jsonc
{
  "id": "m7",                     // must match the demo slide's data-demo attribute
  "module": "M7",
  "title": "...",
  "minutes": 6,                   // feeds the schedule slide's timing
  "tools": ["..."],
  "lands": "the concept it teaches",
  "watch_for": "the tell, or the failure",
  "prompts": [ ... ]
}
```

Then add a matching slide in `modules/`:

```html
<section class="demo-slide" data-demo="m7">
  <!-- title/lands/watch_for/strip are rendered from the JSON -->
</section>
```

The slide body is generated — you do not hand-write the prompt buttons.

---

## Checklist before a delivery

- [ ] `client` block matches the SME you are actually training tomorrow
- [ ] every `active` prompt has been run once on the demo machine
- [ ] `[PASTE ...]` gaps have real material ready beside the laptop
- [ ] synthetic demo data generated (see `demo-data/README.md`)
- [ ] offline fallback screenshots taken for every `active` prompt
- [ ] `node build.mjs` run after the last JSON edit
