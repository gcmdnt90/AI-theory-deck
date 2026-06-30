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

## Contents

- `index.html` is the generated presentation.
- `modules/` contains the source slide fragments.
- `template.html` defines the presentation shell.
- `css/theme.css` contains the light visual theme.
- `assets/` contains generated images, SVG assets, and animation media.
- `vendor/` contains local Reveal.js and KaTeX dependencies.
- `widgets/theory-widgets.js` powers the interactive examples.

## Edit And Rebuild

Edit the files in `modules/`, then rebuild:

```bash
node build.mjs
```

Do not edit `index.html` directly unless you are making a quick disposable
change. It is generated from `template.html` and the module fragments.

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
