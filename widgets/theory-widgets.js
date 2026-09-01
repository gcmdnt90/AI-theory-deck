(() => {
  // Locale switch: index.it.html sets <html lang="it">. English keys/strings
  // stay the default; Italian entries mirror them 1:1 for the IT build.
  const IT = (document.documentElement.lang || "en").toLowerCase().startsWith("it");
  // Tokenizer-explainer strings.
  // Tokenizer-explainer strings. The tokenizer itself is the real cl100k_base
  // BPE (widgets/bpe-cl100k.js), so these describe frequency, not guesswork.
  const R = IT ? {
    rank: "pezzo n.",
    common: "tra i più frequenti",
    mid: "frequente",
    rare: "raro, quindi costa più token",
    leadingSpace: " · include lo spazio iniziale",
    partial: "mezzo carattere: una lettera accentata può occupare due token",
    hint: "Passa sopra un token per vedere quanto è frequente.",
    stats: (n, cpt) => `${n} token · ${cpt} caratteri per token`,
    missing: "Tokenizer non caricato."
  } : {
    rank: "piece no.",
    common: "among the most frequent",
    mid: "frequent",
    rare: "rare, so it costs more tokens",
    leadingSpace: " · carries the leading space",
    partial: "half a character: an accented letter can take two tokens",
    hint: "Hover a token to see how frequent it is.",
    stats: (n, cpt) => `${n} tokens · ${cpt} characters per token`,
    missing: "Tokenizer not loaded."
  };

  // Real next-token distributions, measured once against the OpenAI completions
  // endpoint (model gpt-3.5-turbo-instruct, temperature 1, top-5 logprobs,
  // 2026-08-26). Values are the model's actual probabilities, not normalised:
  // "rest" is 1 - sum(top 5), i.e. everything else the model was considering.
  const nextTokenExamples = {
    "La capitale d'Italia \u00e8": [
      { name: "Roma", value: .8107 },
      { name: "la", value: .0356 },
      { name: "\u23ce a capo", value: .0347 },
      { name: "\u23ce", value: .0202 },
      { name: "una", value: .0129 },
      { name: "tutto il resto", value: .0859, kind: "rest" }
    ],
    "Il preventivo deve indicare il": [
      { name: "costo", value: .3398 },
      { name: "pre", value: .2960 },
      { name: "numero", value: .0683 },
      { name: "nome", value: .0253 },
      { name: "tot", value: .0205 },
      { name: "tutto il resto", value: .2501, kind: "rest" }
    ],
    "La moneta \u00e8 stata coniata in": [
      { name: "oro", value: .0858 },
      { name: "due", value: .0658 },
      { name: "arg", value: .0596 },
      { name: "tre", value: .0582 },
      { name: "occas", value: .0486 },
      { name: "tutto il resto", value: .6820, kind: "rest" }
    ],
    "Per verificare il risultato bisogna": [
      { name: "es", value: .0597 },
      { name: "ver", value: .0467 },
      { name: "fare", value: .0369 },
      { name: "cal", value: .0356 },
      { name: "confront", value: .0353 },
      { name: "tutto il resto", value: .7858, kind: "rest" }
    ],
    "The capital of Italy is": [
      { name: "Rome", value: .8012 },
      { name: "\u23ce new line", value: .0670 },
      { name: "\u23ce", value: .0176 },
      { name: ":\u23ce", value: .0119 },
      { name: "the", value: .0076 },
      { name: "everything else", value: .0947, kind: "rest" }
    ],
    "The quote must state the": [
      { name: "following", value: .0854 },
      { name: "name", value: .0604 },
      { name: "price", value: .0433 },
      { name: "exact", value: .0400 },
      { name: "source", value: .0301 },
      { name: "everything else", value: .7408, kind: "rest" }
    ],
    "The satellite detected a": [
      { name: "total", value: .0916 },
      { name: "fire", value: .0853 },
      { name: "large", value: .0563 },
      { name: "bright", value: .0428 },
      { name: "\u2423 space", value: .0376 },
      { name: "everything else", value: .6864, kind: "rest" }
    ],
    "To check the result you have to": [
      { name: "follow", value: .3516 },
      { name: "visit", value: .1605 },
      { name: "go", value: .1084 },
      { name: "enter", value: .0530 },
      { name: "click", value: .0412 },
      { name: "everything else", value: .2853, kind: "rest" }
    ]
  };

  function normalise(values) {
    const sum = values.reduce((acc, v) => acc + v, 0);
    return values.map((v) => v / sum);
  }

  function renderBars(root, items) {
    const list = root.querySelector(".bar-list");
    if (!list) return;
    list.innerHTML = "";
    items.forEach(({ name, value, kind }) => {
      const row = document.createElement("div");
      row.className = kind === "rest" ? "bar-row rest" : "bar-row";
      const pct = value * 100;
      const shown = pct >= 10 ? Math.round(pct) : pct.toFixed(1).replace(".", IT ? "," : ".");
      row.innerHTML = `
        <span class="name">${name}</span>
        <span class="bar-shell"><span class="bar-fill" style="width:${Math.max(2, pct)}%"></span></span>
        <span class="value">${shown}%</span>
      `;
      list.appendChild(row);
    });
  }

  function renderTempCurve(root, probs, names) {
    const svg = root.querySelector("[data-temp-distribution]");
    if (!svg) return;
    const width = 520;
    const padX = 54;
    const baseY = 132;
    const topY = 26;
    const usableW = width - padX * 2;
    const maxP = Math.max(...probs, 0.01);
    const points = probs.map((p, i) => {
      const x = padX + (usableW * i) / (probs.length - 1);
      const y = baseY - (p / maxP) * 86;
      return [x, y];
    });
    const smooth = points.map(([x, y], i) => {
      if (i === 0) return `M ${x} ${y}`;
      const [px, py] = points[i - 1];
      const cx = (px + x) / 2;
      return `C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
    }).join(" ");
    const area = `${smooth} L ${points.at(-1)[0]} ${baseY} L ${points[0][0]} ${baseY} Z`;
    svg.innerHTML = `
      <line class="axis-line" x1="${padX}" y1="${baseY}" x2="${width - 24}" y2="${baseY}" stroke-width="1.4"/>
      <line class="axis-line" x1="${padX}" y1="${baseY}" x2="${padX}" y2="${topY}" stroke-width="1.4"/>
      <text class="axis-label" x="${padX - 10}" y="${topY + 4}" text-anchor="end">${IT ? "probabilità" : "probability"}</text>
      <text class="axis-label" x="${width - 26}" y="179" text-anchor="end">${IT ? "token candidato" : "candidate token"}</text>
      <path d="${area}"></path>
      ${points.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 5 : 4}" fill="${i === 0 ? "var(--ait-amber)" : "var(--ait-cyan)"}"></circle>`).join("")}
      ${points.map(([x], i) => `<text class="temp-word" x="${x}" y="162" text-anchor="middle">${names[i]}</text>`).join("")}
    `;
  }

  function initNextToken() {
    document.querySelectorAll("[data-next-token-widget]").forEach((root) => {
      const display = root.querySelector("[data-prompt-text]");
      const switcher = root.querySelector(".prompt-switcher");
      let buttons = [];
      let current = null;

      const build = () => {
        const set = sectorState.examples("next_token");
        if (set && set.length && switcher) {
          switcher.innerHTML = set.map((ex, k) =>
            `<button type="button" data-prompt-key="${k}" aria-pressed="${k === 0}">${loc(ex, "label")}</button>`
          ).join("");
        }
        buttons = [...root.querySelectorAll(".prompt-switcher button")];
        buttons.forEach((b) => b.addEventListener("click", () => paint(b)));
        paint(buttons[0]);
      };

      const paint = (button) => {
        if (!button) return;
        current = button;
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        const set = sectorState.examples("next_token");
        let prompt, bars;
        if (set && set.length && button.dataset.promptKey !== undefined) {
          const ex = set[Number(button.dataset.promptKey)];
          prompt = loc(ex, "text");
          bars = loc(ex, "bars") || [];
        } else {
          prompt = button.dataset.prompt;
          bars = nextTokenExamples[prompt] || [];
        }
        if (display) display.textContent = prompt;
        renderBars(root, bars);
      };

      build();
      sectorState.on(build);
    });
  }

  function rankBand(rank) {
    if (rank === undefined || rank === null) return "rare";
    if (rank < 2000) return "common";
    if (rank < 25000) return "mid";
    return "rare";
  }

  function initTokenizerWidget() {
    document.querySelectorAll("[data-tokenizer-widget]").forEach((root) => {
      const input = root.querySelector(".tokenizer-input");
      const output = root.querySelector("[data-token-output]");
      const explainer = root.querySelector("[data-token-explainer]");
      const stats = root.querySelector("[data-token-stats]");
      const switcher = root.querySelector(".token-presets");
      if (!input || !output || !explainer) return;

      const engine = window.AITBpe;
      if (!engine) { explainer.textContent = R.missing; return; }

      const locale = IT ? "it-IT" : "en-GB";
      let buttons = [];

      const explain = (piece) => {
        const shown = piece.text === "" ? "\u00b7" : piece.text.replace(/^ /, "\u2423").replace(/\n/g, "\u23ce");
        if (piece.text === "") { explainer.textContent = `${shown} \u2014 ${R.partial}`; return; }
        const rank = piece.rank === undefined ? "?" : piece.rank.toLocaleString(locale);
        const space = /^ /.test(piece.text) ? R.leadingSpace : "";
        explainer.textContent = `${shown} \u2014 ${R.rank} ${rank} \u00b7 ${R[rankBand(piece.rank)]}${space}`;
      };

      const update = () => {
        output.innerHTML = "";
        const pieces = engine.tokenize(input.value);
        pieces.forEach((piece) => {
          const token = document.createElement("span");
          const band = rankBand(piece.rank);
          token.className = "token-pill";
          if (band === "mid") token.classList.add("violet");
          if (band === "rare") token.classList.add("hot");
          token.tabIndex = 0;
          token.textContent = piece.text === "" ? "\u00b7" : piece.text;
          token.addEventListener("mouseenter", () => explain(piece));
          token.addEventListener("focus", () => explain(piece));
          token.addEventListener("click", () => explain(piece));
          output.appendChild(token);
        });
        if (stats) {
          const chars = input.value.length;
          const cpt = pieces.length ? (chars / pieces.length).toFixed(1).replace(".", IT ? "," : ".") : "0";
          stats.textContent = pieces.length ? R.stats(pieces.length, cpt) : "";
        }
        explainer.textContent = R.hint;
      };

      const build = () => {
        const set = sectorState.examples("tokenizer");
        if (set && set.length && switcher) {
          switcher.innerHTML = set.map((ex, k) =>
            `<button type="button" data-sentence="${loc(ex, "text").replace(/"/g, "&quot;")}" aria-pressed="${k === 0}">${loc(ex, "label")}</button>`
          ).join("");
          input.value = loc(set[0], "text");
        }
        buttons = [...root.querySelectorAll(".token-presets button")];
        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            input.value = button.dataset.sentence;
            update();
          });
        });
        update();
      };

      input.addEventListener("input", () => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
        update();
      });

      build();
      sectorState.on(build);
    });
  }

  function initTemperature() {
    // Base distribution = REAL measured top-5 probabilities (see
    // nextTokenExamples); logits are their logs, so at T = 1 the bars are the
    // measured values renormalised over the five, and the slider applies the
    // genuine softmax(logit / T).
    const fallback = IT
      ? { names: ["costo", "pre", "numero", "nome", "tot"], probs: [.3398, .2960, .0683, .0253, .0205] }
      : { names: ["follow", "visit", "go", "enter", "click"], probs: [.3516, .1605, .1084, .0530, .0412] };

    document.querySelectorAll("[data-temp-widget]").forEach((root) => {
      const slider = root.querySelector("input[type='range']");
      const label = root.querySelector("[data-temp-value]");
      let phase = 0;
      let lastManualChange = 0;

      const source = () => {
        const set = sectorState.examples("temperature");
        const names = set ? loc(set, "names") : null;
        const probs = set ? loc(set, "probs") : null;
        return (names && probs && names.length === probs.length)
          ? { names, probs }
          : fallback;
      };

      const update = () => {
        const { names, probs } = source();
        const logits = probs.map((v) => Math.log(v));
        const t = Number(slider.value);
        label.textContent = t.toFixed(1);
        const exps = logits.map((v) => Math.exp(v / t));
        const out = normalise(exps);
        renderBars(root, names.map((name, i) => ({ name, value: out[i] })));
        renderTempCurve(root, out, names);
      };

      slider.addEventListener("input", () => { lastManualChange = Date.now(); update(); });
      sectorState.on(update);
      update();

      // Slow idle drift: enough to draw the eye, slow enough not to read as a bug.
      window.setInterval(() => {
        if (Date.now() - lastManualChange < 12000) return;
        phase += .09;
        slider.value = (1.1 + Math.sin(phase) * .85).toFixed(1);
        update();
      }, 2400);
    });
  }

  function initReasoningWidget() {
    document.querySelectorAll("[data-reason-widget]").forEach((root) => {
      const buttons = [...root.querySelectorAll("button[data-mode]")];
      const copy = root.querySelector("[data-reason-copy]");
      const diagram = root.querySelector("[data-reason-diagram]");
      const modes = IT ? {
        trained: {
          copy: "Dentro il modello: il post-training cambia il comportamento aggiornando parametri o policy. La capacità viene portata avanti senza dover ripetere un trucco di prompt.",
          html: `
            <div class="reason-art">
              <img src="assets/img/m03-reason-trained.png" alt="Esempi di addestramento e feedback che fluiscono in un modello i cui pesi interni cambiano">
              <div class="reason-labels">
                <span>dati di training + feedback</span>
                <span>i pesi cambiano</span>
                <span>comportamento portato dentro</span>
                <span>riusato senza trucchi di prompt</span>
              </div>
            </div>`
        },
        prompted: {
          copy: "Intorno al modello: i pesi restano fissi. Forniamo un'impalcatura esterna — passi, esempi, strumenti o un loop — ogni volta che ci serve quel comportamento.",
          html: `
            <div class="reason-art">
              <img src="assets/img/m03-reason-prompted.png" alt="Un modello congelato avvolto da prompt esterni, strumenti, esempi e impalcature di loop">
              <div class="reason-labels">
                <span>modello congelato</span>
                <span>impalcatura esterna</span>
                <span>istruzioni + esempi</span>
                <span>fornita di nuovo ogni volta</span>
              </div>
            </div>`
        }
      } : {
        trained: {
          copy: "Inside the model: post-training changes behaviour by updating parameters or policies. The ability is carried forward without re-sending a prompt trick.",
          html: `
            <div class="reason-art">
              <img src="assets/img/m03-reason-trained.png" alt="Training examples and feedback flowing into a model whose internal weights change">
              <div class="reason-labels">
                <span>training data + feedback</span>
                <span>weights change</span>
                <span>behaviour carried inside</span>
                <span>reused without a prompt trick</span>
              </div>
            </div>`
        },
        prompted: {
          copy: "Around the model: the weights stay fixed. We supply an external scaffold, such as steps, examples, tools or a loop, each time we need the behaviour.",
          html: `
            <div class="reason-art">
              <img src="assets/img/m03-reason-prompted.png" alt="A frozen model wrapped by external prompts, tools, examples and loop scaffolding">
              <div class="reason-labels">
                <span>frozen model</span>
                <span>external scaffold</span>
                <span>instructions + examples</span>
                <span>supplied again each time</span>
              </div>
            </div>`
        }
      };
      const update = (mode) => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
        copy.textContent = modes[mode].copy;
        diagram.innerHTML = modes[mode].html;
      };
      buttons.forEach((button) => button.addEventListener("click", () => update(button.dataset.mode)));
      update("trained");
    });
  }

  /* ------------------------------------------------------------------ *
   * Demo slides — rendered from demo-prompts.json, inlined by build.mjs
   * into a <script id="demo-prompts"> tag so the deck still works from
   * file:// with no server. Edit the JSON, never the slide. See PROMPTS.md.
   * ------------------------------------------------------------------ */

  // Same guard as the template: never let a storage exception blank the deck.
  const store = (typeof window !== "undefined" && window.deckStore) || {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const DEMO_STR = IT ? {
    banner: "PROVIAMOLO",
    sector: "Esempio di settore",
    sectors_one: "1 settore configurato",
    sectors_n: "settori configurati",
    sector_hint: "vale per tutti i widget e tutte le demo",
    paste: "da incollare",
    copy: "copia",
    copied: "copiato",
    missing: "Prompt non trovati per questo modulo.",
    requires: "Richiede"
  } : {
    banner: "WE TRY IT",
    sector: "Sector example",
    sectors_one: "1 sector configured",
    sectors_n: "sectors configured",
    sector_hint: "applies to every widget and every demo",
    paste: "to paste",
    copy: "copy",
    copied: "copied",
    missing: "No prompts found for this module.",
    requires: "Requires"
  };

  /* ------------------------------------------------------------------ *
   * Sector state - ONE choice for the whole deck, made on the schedule
   * slide before the lesson starts. Widgets and demo slides subscribe to it
   * instead of each carrying their own picker.
   * ------------------------------------------------------------------ */

  const sectorState = (() => {
    let data = null;
    let id = null;
    const subs = [];
    const list = () => (data && data.sectors) || [];
    const current = () => list().find((s) => s.id === id) || list()[0] || null;
    return {
      init(d) {
        data = d;
        const stored = store.get("deck-sector");
        id = list().some((s) => s.id === stored)
          ? stored
          : (d && d.default_sector) || (list()[0] && list()[0].id) || null;
      },
      list,
      current,
      get id() { return id; },
      client: () => (current() || {}).client || {},
      // widget_examples[<sector id>][<widget>] - missing entries fall back to
      // whatever the widget ships with, so a half-configured sector degrades
      // to the default example rather than to a blank slide.
      examples(widget) {
        const all = data && data.widget_examples;
        const forSector = all && (all[id] || null);
        return (forSector && forSector[widget]) || null;
      },
      set(next) {
        if (!next || next === id) return;
        id = next;
        store.set("deck-sector", next);
        subs.forEach((fn) => { try { fn(); } catch (e) { console.warn(e); } });
      },
      on(fn) { subs.push(fn); }
    };
  })();

  function initSectorPicker() {
    const host = document.querySelector("[data-sector-picker]");
    if (!host) return;
    const sectors = sectorState.list();
    if (!sectors.length) return;
    host.innerHTML = `
      <label class="sector-pick">
        <span class="sector-key">${DEMO_STR.sector}</span>
        <select data-sector-select aria-label="${DEMO_STR.sector}">
          ${sectors.map((s) => `<option value="${s.id}">${loc(s, "label")}</option>`).join("")}
        </select>
      </label>
      <span class="sector-count">${DEMO_STR.sector_hint}</span>`;
    const select = host.querySelector("select");
    select.value = sectorState.id;
    select.addEventListener("change", () => sectorState.set(select.value));
    sectorState.on(() => { select.value = sectorState.id; });
  }

  function loadDemoData() {
    const tag = document.getElementById("demo-prompts");
    if (!tag) return null;
    try {
      return JSON.parse(tag.textContent);
    } catch (err) {
      console.warn("demo-prompts.json is not valid JSON:", err.message);
      return null;
    }
  }

  // Italian mirrors live in `<field>_it`, falling back to the English field so
  // a missing translation degrades to readable rather than to blank.
  function loc(obj, key) {
    if (!obj) return "";
    return (IT && obj[key + "_it"]) || obj[key] || "";
  }

  // {{KEY}} → the selected sector's client profile. Unknown keys are left
  // visible on purpose: an untouched placeholder on screen is a bug you can
  // see, which is far safer than a silently invented business detail.
  function fill(text, client) {
    if (!text) return "";
    return String(text).replace(/\{\{(\w+)\}\}/g, (whole, key) => {
      if (!client) return whole;
      if (IT && Object.prototype.hasOwnProperty.call(client, key + "_it")) return client[key + "_it"];
      return Object.prototype.hasOwnProperty.call(client, key) ? client[key] : whole;
    });
  }

  /* Demo prompts are stored as finished sentences per sector
     (prompts[].variants[<sector id>]), not as templates: an Italian sentence
     cannot be assembled from placeholders without breaking agreement. The
     shared text stays as the fallback for prompts that read the same everywhere. */
  function promptText(prompt) {
    if (!prompt) return "";
    const variant = prompt.variants && prompt.variants[sectorState.id];
    return loc(variant || prompt, "text");
  }

  // [SQUARE BRACKETS] mark a hole the speaker fills live - make it visible.
  // One bracketed string is NOT a hole: the sector's own uncertainty flag
  // ([DA VERIFICARE]). That one is output the model has to write, not input
  // the speaker types, and highlighting it says the opposite.
  function markHoles(text) {
    const client = sectorState.client() || {};
    const flags = [client.FLAG, client.FLAG_it].filter(Boolean);
    return String(text)
      .replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]))
      .replace(/\[[^\]\n]+\]/g, (hole) =>
        flags.indexOf(hole) >= 0 ? hole : `<span class="prompt-hole">${hole}</span>`);
  }

  function copyText(text, button) {
    const done = () => {
      const original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      button.textContent = DEMO_STR.copied;
      button.classList.add("is-copied");
      setTimeout(() => {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 1400);
    };
    // navigator.clipboard is unavailable on file:// in some browsers, so the
    // execCommand path is a real fallback here, not legacy cruft.
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:absolute;left:-9999px;top:0;";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* clipboard blocked */ }
      document.body.removeChild(ta);
    }
  }

  /* Demo slides are PROJECTED SURFACES: everything on them is meant to be seen
     by the room. Trainer-facing material (what the demo lands, what to watch
     for, per-prompt conduct notes) goes into the speaker notes instead — press
     S for the speaker view. The only things on screen are the title, the tools,
     the prompt itself and the way to change it. */
  function initDemoSlides() {
    const slides = document.querySelectorAll(".demo-slide[data-demo]");
    if (!slides.length) return;
    const demos = ((loadDemoData() || {}).demos) || [];

    slides.forEach((slide) => {
      const demo = demos.find((d) => d.id === slide.dataset.demo);
      if (!demo) {
        slide.innerHTML = `<h2>${DEMO_STR.banner}</h2><p class="footnote">${DEMO_STR.missing}</p>`;
        return;
      }

      // Active prompts first, library ones after: the live run reads left to
      // right, the archive stays reachable without cluttering it.
      const prompts = (demo.prompts || [])
        .slice()
        .sort((a, b) => (a.status === "library") - (b.status === "library"));

      slide.innerHTML = `
        <div class="demo-head">
          <span class="demo-banner">&#9654; ${DEMO_STR.banner}</span>
          <h2 data-demo-title></h2>
          <span class="demo-min">${demo.minutes || "?"}&#8202;min</span>
        </div>
        <div class="demo-bar">
          <span class="sector-chip" data-demo-sector></span>
          <span class="demo-tools" data-demo-tools></span>
        </div>
        <p class="demo-limits" data-demo-limits hidden></p>
        <div class="demo-panel">
          <pre class="demo-prompt-text" data-demo-text></pre>
          <button type="button" class="demo-copy" data-demo-copy>${DEMO_STR.copy}</button>
        </div>
        <p class="demo-requires" data-demo-requires hidden></p>
        <ol class="demo-rungs" data-demo-rungs hidden></ol>
        <div class="prompt-strip" role="group" aria-label="Prompt database">
          ${prompts.map((p) => `
            <button type="button" data-prompt-id="${p.id}"
                    class="${p.status === "library" ? "is-library" : ""}"
                    aria-pressed="false"><span class="p-label"></span></button>`).join("")}
        </div>
        <aside class="notes" data-demo-notes></aside>`;

      const out = slide.querySelector("[data-demo-text]");
      const copyBtn = slide.querySelector("[data-demo-copy]");
      const buttons = Array.from(slide.querySelectorAll(".prompt-strip button"));
      let currentId = prompts[0] && prompts[0].id;

      const paint = () => {
        const client = sectorState.client();
        const sector = sectorState.current();
        slide.querySelector("[data-demo-title]").textContent = fill(loc(demo, "title"), client);
        slide.querySelector("[data-demo-sector]").textContent = sector ? loc(sector, "label") : "";
        slide.querySelector("[data-demo-tools]").innerHTML =
          (demo.tools || []).map((t) => `<span class="demo-tool">${t}</span>`).join("");
        const limits = slide.querySelector("[data-demo-limits]");
        const limitsText = loc(demo, "limits");
        limits.textContent = limitsText;
        limits.hidden = !limitsText;
        buttons.forEach((b) => {
          const p = prompts.find((x) => x.id === b.dataset.promptId);
          b.querySelector(".p-label").textContent = fill(loc(p, "label"), client);
          b.setAttribute("aria-pressed", String(b.dataset.promptId === currentId));
        });
        // The rungs are a projected surface too: the room should see the run
        // order before it starts, and that rungs 2 and 3 hold the same files.
        const rungsEl = slide.querySelector("[data-demo-rungs]");
        const rungs = demo.rungs || [];
        rungsEl.hidden = !rungs.length;
        rungsEl.innerHTML = rungs.map((r) => `
          <li>
            <span class="rung-n">${r.n}</span>
            <span class="rung-tool">${r.tool || ""}</span>
            <strong>${fill(loc(r, "label"), client)}</strong>
            <span class="rung-what">${fill(loc(r, "what"), client)}</span>
          </li>`).join("");
        const p = prompts.find((x) => x.id === currentId);
        out.innerHTML = markHoles(promptText(p));
        // Some prompts only run if something is installed or connected first.
        // The warning belongs on the projected slide, not in the notes: the
        // room watches the prompt get pasted, and a silent failure reads as
        // the model refusing.
        const reqEl = slide.querySelector("[data-demo-requires]");
        const req = fill(loc(p, "requires"), client);
        reqEl.textContent = req ? `* ${DEMO_STR.requires} ${req}` : "";
        reqEl.hidden = !req;
        // Speaker view only - never rendered on the projected slide.
        slide.querySelector("[data-demo-notes]").innerHTML = `
          <p><strong>${fill(loc(demo, "lands"), client)}</strong></p>
          <p><em>${fill(loc(demo, "watch_for"), client)}</em></p>
          <ul>${prompts.map((x) => {
            const paste = loc(x, "paste");
            return `<li><strong>${fill(loc(x, "label"), client)}</strong> &mdash; ${fill(loc(x, "note"), client)}`
              + (paste ? ` <em>${DEMO_STR.paste}: ${paste}</em>` : "") + `</li>`;
          }).join("")}</ul>`;
      };

      buttons.forEach((b) => b.addEventListener("click", () => { currentId = b.dataset.promptId; paint(); }));
      copyBtn.addEventListener("click", () => copyText(out.textContent, copyBtn));
      sectorState.on(paint);
      paint();
    });
  }

  /* ------------------------------------------------------------------ *
   * Schedule — wall-clock times computed from a start time, so the room
   * sees "M3 at 15:20", not "M3 after 40 minutes". Start defaults to now,
   * is editable, and is remembered per browser.
   * ------------------------------------------------------------------ */

  function initSchedule() {
    const table = document.querySelector("[data-schedule-widget]");
    if (!table) return;
    const startInput = document.querySelector("[data-schedule-start]");
    const totalOut = document.querySelector("[data-schedule-total]");
    const nowBtn = document.querySelector("[data-schedule-now]");
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    const pad = (n) => String(n).padStart(2, "0");
    const hhmm = (mins) => `${pad(Math.floor((mins % 1440) / 60))}:${pad(mins % 60)}`;

    const nowMinutes = () => {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    };
    const roundedNow = () => Math.ceil(nowMinutes() / 5) * 5;

    const parse = (value) => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(value || "");
      return m ? (+m[1]) * 60 + (+m[2]) : null;
    };

    let start = parse(store.get("deck-start"));
    if (start === null) start = roundedNow();
    if (startInput) startInput.value = hhmm(start);

    const render = () => {
      let cursor = start;
      const current = nowMinutes();
      rows.forEach((row) => {
        const mins = (+row.dataset.theory || 0) + (+row.dataset.demo || 0);
        const from = cursor;
        const to = cursor + mins;
        const cell = row.querySelector(".c-clock");
        if (cell) cell.textContent = hhmm(from);
        row.classList.toggle("is-now", current >= from && current < to);
        // Module covers carry their own start time in small print.
        document.querySelectorAll(`[data-clock-for="${row.dataset.block}"]`)
          .forEach((el) => { el.textContent = `${hhmm(from)}–${hhmm(to)}`; });
        cursor = to;
      });
      if (totalOut) {
        const total = cursor - start;
        totalOut.textContent = `${hhmm(start)} → ${hhmm(cursor)} · ${Math.floor(total / 60)}h${pad(total % 60)}`;
      }
    };

    if (startInput) {
      startInput.addEventListener("change", () => {
        const v = parse(startInput.value);
        if (v === null) return;
        start = v;
        store.set("deck-start", startInput.value);
        render();
      });
    }
    if (nowBtn) {
      nowBtn.addEventListener("click", () => {
        start = roundedNow();
        if (startInput) startInput.value = hhmm(start);
        store.set("deck-start", hhmm(start));
        render();
      });
    }
    render();
    // Keep the "you are here" highlight honest during the lesson.
    setInterval(render, 30000);
  }

  /* ------------------------------------------------------------------ *
   * Edition switch — index.html (SME) ⇄ academic.html. Both files are
   * produced by the same build; the language choice is untouched.
   * ------------------------------------------------------------------ */

  function initVersionSwitch() {
    const box = document.querySelector("[data-version-switch]");
    if (!box) return;
    const current = document.documentElement.dataset.edition || "sme";
    const files = { sme: "index.html", academic: "academic.html" };
    const label = document.querySelector("[data-version-current]");
    if (label) label.textContent = current === "academic" ? (IT ? "Accademica" : "Academic") : "SME";
    box.querySelectorAll("button[data-edition]").forEach((b) => {
      const isCurrent = b.dataset.edition === current;
      b.setAttribute("aria-pressed", String(isCurrent));
      b.disabled = isCurrent;
      b.addEventListener("click", () => {
        const target = files[b.dataset.edition];
        if (target) location.href = target;
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Standing-rules panel - the projected file block on M4. It does not
   * hold its own copy of the rules: it renders the SAME prompt the demo
   * will paste (demo-prompts.json, default m4-p2), for the sector chosen
   * on the schedule slide. Slide and prompt cannot drift apart, because
   * there is only one text.
   * ------------------------------------------------------------------ */

  function initStandingRules() {
    const hosts = document.querySelectorAll("[data-standing-rules]");
    if (!hosts.length) return;
    const demos = ((loadDemoData() || {}).demos) || [];
    const findPrompt = (id) => {
      for (const d of demos) {
        const hit = (d.prompts || []).find((p) => p.id === id);
        if (hit) return hit;
      }
      return null;
    };

    hosts.forEach((host) => {
      const prompt = findPrompt(host.dataset.standingRules || "m4-p2");
      const heading = host.dataset.standingRulesHeading || "# Standing rules";
      const paint = () => {
        if (!prompt) { host.innerHTML = `<div class="rule">${heading}</div>`; return; }
        const lines = String(promptText(prompt)).split("\n");
        host.innerHTML = `<div class="rule">${heading}</div>`
          + lines.map((line) => `<div>${markHoles(line)}</div>`).join("");
      };
      sectorState.on(paint);
      paint();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    sectorState.init(loadDemoData() || {});
    initSectorPicker();
    initNextToken();
    initTokenizerWidget();
    initTemperature();
    initReasoningWidget();
    initStandingRules();
    initDemoSlides();
    initSchedule();
    initVersionSwitch();
  });
})();
