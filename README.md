# Theory deck light edition

This is the light-theme visual copy of `framework/full-course/theory-deck`.
It keeps the original theory arc and speaker notes, but replaces the scaffold
media slots with generated raster art, editable SVG/HTML infographics, and small
offline widgets.

## View it

Open `index.html` in a browser. The deck is still Reveal.js and still runs
offline from `file://`.

## Edit it

Edit source fragments in `modules/`, then rebuild:

```bash
node build.mjs
```

Do not edit `index.html` directly; it is generated from `template.html` and the
module fragments.

## Visual assets

- `assets/img/` contains the generated Signal-on-Paper raster art.
- `assets/svg/icons.svg` contains the small icon system.
- Technical diagrams are inline SVG or HTML inside the module files so labels
  remain exact and editable.
- `widgets/theory-widgets.js` powers the local next-token and temperature demos.

## Style

The deck follows `ART-DIRECTION.md`: warm paper canvas, dark graphite type,
semantic pastel accents, thin linework, minimal text, and editable labelled
diagrams where precision matters.
