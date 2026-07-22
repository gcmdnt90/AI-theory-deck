# AI Theory Deck

A light-theme Reveal.js course deck about modern AI systems: language models,
transformer foundations, agents, context, tools, security, and the human choices
around using these systems well.

## View Online

After GitHub Pages is enabled, the deck is available at:

```text
https://gcmdnt90.github.io/AI-theory-deck/
```

## View Locally

Open `index.html` directly in a browser. The deck is self-contained and can run
offline from `file://`.

## Languages

The deck is **bilingual in a single `index.html`**. Both the English and Italian
decks are embedded, and a **language toggle (EN / IT) sits fixed in the top-right
of every slide**. Switching language reloads the page but keeps the current slide
number (both decks share the same slide order), and the choice is remembered in
`localStorage`. This means GitHub Pages always serves `index.html` no matter which
language is shown — no file renaming when you change published language.

- Default language on first visit is set by `DEFAULT_LANG` near the top of the
  runtime script in `template.html` (currently `'it'`; set to `'en'` for English).
- `index.it.html` is kept only as a compatibility redirect to `index.html` (it
  forces Italian). Old bookmarks still work.

## Contents

- `index.html` is the generated bilingual presentation (EN + IT).
- `modules/` contains the English source slide fragments; `modules/it/` the Italian.
- `template.html` defines the presentation shell and the language toggle.
- `css/theme.css` contains the light visual theme.
- `assets/` contains generated images, SVG assets, and animation media.
- `vendor/` contains local Reveal.js and KaTeX dependencies.
- `widgets/theory-widgets.js` powers the interactive examples (locale-aware via
  `document.documentElement.lang`).

## Edit And Rebuild

Edit the English fragments in `modules/` and the Italian ones in `modules/it/`
(keep them structurally parallel), then rebuild:

```bash
node build.mjs
```

This regenerates `index.html` (both languages inlined) and the `index.it.html`
redirect. Do not edit `index.html` directly unless you are making a quick
disposable change — it is generated from `template.html` and the module fragments.

## Publishing

This repo is intended to be served with GitHub Pages from the `main` branch and
the repository root.

Recommended Pages settings:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

## Design Direction

The deck uses a warm paper canvas, dark graphite typography, semantic pastel
accents, thin linework, generated raster art, and editable SVG/HTML diagrams.
See `ART-DIRECTION.md` for the visual system.
