# Art direction - "Signal-on-Paper"

This file is the source of truth for the light-theme theory deck. It keeps the
same simple infographic idea as the dark visual edition, but moves the whole
deck onto a warm paper canvas with readable graphite type.

## Style system

**Name:** Signal-on-Paper

Think: lecture-room clarity, editorial science infographic, and handout-quality
legibility. The deck should feel bright, precise, generous, and calm.

| Role | Hex | Use |
|---|---|---|
| Paper | `#fbfaf6` | slide canvas and raster backgrounds |
| Surface | `#ffffff` | cards, frames, inset diagrams |
| Graphite | `#243044` | primary type and linework |
| Muted | `#6b7788` | secondary labels and notes |
| Hairline | `#d9e1ea` | grid, dividers, inactive paths |
| Amber signal | `#e3a12f` | active path, key node, attention |
| Cyan inside | `#1597b5` | weights, attention, embeddings, model internals |
| Violet around | `#8366c8` | agents, tools, loops, orchestration |
| Green safe | `#34956f` | human judgement, verification, safety |
| Red risk | `#c94b4b` | injection, leakage, failure |

Colour is semantic, not decorative. Cyan means "inside the model"; violet means
"around the model"; amber means "follow this signal".

## Raster prompt suffix

Use this suffix for generated concept art and cover backgrounds:

```text
STYLE: premium light-theme editorial infographic on a warm off-white paper
background (#fbfaf6), dark graphite linework (#243044), thin crisp vector-like
strokes, sparse pale dot-grid, subtle paper texture, flat design, generous
negative space, classroom-friendly clarity. Use one warm amber signal accent
(#e3a12f), calm cyan (#1597b5), soft violet (#8366c8), mint green (#34956f),
and risk red (#c94b4b) only when semantically needed.
NEGATIVE: dark background, black canvas, neon glow, photorealism, stock photo,
glossy 3D robot, brain-with-circuits cliche, rainbow gradient, busy clutter,
watermark, garbled text.
```

## Raster assets

All final raster assets live in `assets/img/` and were generated with the
built-in image generator, then copied into this project folder.

| File | Purpose |
|---|---|
| `cover-signal.png` | full-deck cover background |
| `module-01-history.png` | history module cover |
| `module-02-llm-core.png` | LLM core module cover |
| `module-03-architectures.png` | architectures module cover |
| `module-04-context-memory.png` | context and memory module cover |
| `module-05-behaviour-control.png` | behaviour control module cover |
| `module-06-mcp-connectors.png` | MCP and connectors module cover |
| `module-07-security-risks.png` | security and risks module cover |
| `module-08-ethics.png` | ethics module cover |
| `shannon-signal.png` | Shannon/language-as-signal concept |
| `stochastic-parrot.png` | stochastic parrot concept |
| `cognitive-delegation.png` | cognitive delegation concept |
| `human-loop.png` | human-in-the-loop concept |

## Vector rule

Use inline SVG or HTML/CSS for labelled technical diagrams. Image generators are
fine for mood and concepts, but labels, arrows, counts, and equations stay
editable in the source modules.
