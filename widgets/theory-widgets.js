(() => {
  // Locale switch: index.it.html sets <html lang="it">. English keys/strings
  // stay the default; Italian entries mirror them 1:1 for the IT build.
  const IT = (document.documentElement.lang || "en").toLowerCase().startsWith("it");
  // Tokenizer-explainer strings.
  const R = IT ? {
    prefix: "Prefisso comune mantenuto come pezzo unico.",
    suffix: "Suffisso comune separato come sotto-parola.",
    longFirst: "Parola lunga divisa in un primo pezzo riutilizzabile.",
    longRest: "Il resto diventa un pezzo di continuazione.",
    shortWord: "Una parola breve e frequente può restare un solo token.",
    numbers: "I numeri vengono spesso raggruppati per pattern di cifre.",
    punct: "La punteggiatura diventa spesso un token di confine a sé.",
    apostrophe: "Il confine dell'apostrofo può separarsi dalla parola seguente.",
    leadingSpace: " Porta con sé anche un confine di spazio iniziale."
  } : {
    prefix: "Common prefix kept as one piece.",
    suffix: "Common suffix split as a sub-word piece.",
    longFirst: "Long word split into a reusable first piece.",
    longRest: "Remainder becomes a continuation piece.",
    shortWord: "Frequent short word can stay as one token.",
    numbers: "Numbers are often grouped by digit pattern.",
    punct: "Punctuation often becomes its own boundary token.",
    apostrophe: "Apostrophe boundary can split from the following word.",
    leadingSpace: " It also carries a leading-space boundary."
  };
  const nextTokenExamples = {
    "The satellite detected": [
      { name: "cloud cover", value: .34 },
      { name: "heat plumes", value: .24 },
      { name: "movement", value: .19 },
      { name: "a signal", value: .14 },
      { name: "nothing", value: .09 }
    ],
    "The grant proposal needs": [
      { name: "evidence", value: .31 },
      { name: "a budget", value: .25 },
      { name: "revision", value: .19 },
      { name: "partners", value: .15 },
      { name: "clarity", value: .10 }
    ],
    "To verify the result": [
      { name: "compare", value: .30 },
      { name: "rerun", value: .24 },
      { name: "inspect", value: .20 },
      { name: "cite", value: .15 },
      { name: "log", value: .11 }
    ],
    "The old archive contains": [
      { name: "letters", value: .29 },
      { name: "metadata", value: .25 },
      { name: "maps", value: .18 },
      { name: "duplicates", value: .16 },
      { name: "gaps", value: .12 }
    ],
    // — Italian mirrors (same distributions) —
    "Il satellite ha rilevato": [
      { name: "copertura nuvolosa", value: .34 },
      { name: "pennacchi di calore", value: .24 },
      { name: "movimento", value: .19 },
      { name: "un segnale", value: .14 },
      { name: "nulla", value: .09 }
    ],
    "La proposta di progetto richiede": [
      { name: "evidenze", value: .31 },
      { name: "un budget", value: .25 },
      { name: "revisione", value: .19 },
      { name: "partner", value: .15 },
      { name: "chiarezza", value: .10 }
    ],
    "Per verificare il risultato": [
      { name: "confronta", value: .30 },
      { name: "riesegui", value: .24 },
      { name: "ispeziona", value: .20 },
      { name: "cita", value: .15 },
      { name: "registra", value: .11 }
    ],
    "Il vecchio archivio contiene": [
      { name: "lettere", value: .29 },
      { name: "metadati", value: .25 },
      { name: "mappe", value: .18 },
      { name: "duplicati", value: .16 },
      { name: "lacune", value: .12 }
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
    items.forEach(({ name, value }) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <span class="name">${name}</span>
        <span class="bar-shell"><span class="bar-fill" style="width:${Math.max(2, value * 100)}%"></span></span>
        <span class="value">${Math.round(value * 100)}%</span>
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
      const buttons = [...root.querySelectorAll("button[data-prompt]")];
      const display = root.querySelector("[data-prompt-text]");
      const update = (prompt) => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.prompt === prompt)));
        if (display) display.textContent = prompt;
        renderBars(root, nextTokenExamples[prompt] || []);
      };
      buttons.forEach((button) => button.addEventListener("click", () => update(button.dataset.prompt)));
      update(buttons[0]?.dataset.prompt || Object.keys(nextTokenExamples)[0]);
    });
  }

  function splitBareWord(word) {
    const lower = word.toLowerCase();
    const suffixes = ["isation", "ization", "ability", "mente", "enza", "tion", "ment", "ing", "ed", "ly", "s"];
    const suffix = suffixes.find((part) => lower.endsWith(part) && word.length > part.length + 3);
    if (suffix) {
      const cut = word.length - suffix.length;
      return [
        { text: word.slice(0, cut), kind: "token", reason: R.prefix },
        { text: word.slice(cut), kind: "subword", reason: R.suffix }
      ];
    }
    if (word.length > 9) {
      const cut = Math.ceil(word.length / 2);
      return [
        { text: word.slice(0, cut), kind: "token", reason: R.longFirst },
        { text: word.slice(cut), kind: "subword", reason: R.longRest }
      ];
    }
    return [{ text: word, kind: "token", reason: R.shortWord }];
  }

  function teachingTokenize(text) {
    const pieces = [];
    const matches = text.matchAll(/(\s+|[A-Za-zÀ-ÿ']+|\d+(?:[.,]\d+)*|[^\sA-Za-zÀ-ÿ0-9])/g);
    let leadingSpace = false;
    for (const match of matches) {
      const value = match[0];
      if (/^\s+$/.test(value)) {
        leadingSpace = true;
        continue;
      }
      if (/^\d/.test(value)) {
        pieces.push({ text: value, kind: "subword", reason: R.numbers, leadingSpace });
      } else if (/^[^\sA-Za-zÀ-ÿ0-9]$/.test(value)) {
        pieces.push({ text: value, kind: "boundary", reason: R.punct, leadingSpace });
      } else if (value.includes("'")) {
        const [left, ...rest] = value.split("'");
        const right = rest.join("'");
        if (left) pieces.push({ text: `${left}'`, kind: "boundary", reason: R.apostrophe, leadingSpace });
        splitBareWord(right).forEach((piece, index) => {
          pieces.push({ ...piece, leadingSpace: index === 0 ? false : piece.leadingSpace });
        });
      } else {
        splitBareWord(value).forEach((piece, index) => {
          pieces.push({ ...piece, leadingSpace: index === 0 ? leadingSpace : false });
        });
      }
      leadingSpace = false;
    }
    return pieces;
  }

  function initTokenizerWidget() {
    document.querySelectorAll("[data-tokenizer-widget]").forEach((root) => {
      const input = root.querySelector(".tokenizer-input");
      const output = root.querySelector("[data-token-output]");
      const explainer = root.querySelector("[data-token-explainer]");
      const buttons = [...root.querySelectorAll("button[data-sentence]")];
      if (!input || !output || !explainer) return;

      const explain = (piece) => {
        const spaceNote = piece.leadingSpace ? R.leadingSpace : "";
        explainer.textContent = `${piece.text}: ${piece.reason}${spaceNote}`;
      };

      const update = () => {
        output.innerHTML = "";
        const pieces = teachingTokenize(input.value);
        pieces.forEach((piece) => {
          const token = document.createElement("span");
          token.className = "token-pill";
          if (piece.kind === "subword") token.classList.add("violet");
          if (piece.kind === "boundary") token.classList.add("hot");
          token.tabIndex = 0;
          token.textContent = piece.text;
          token.addEventListener("mouseenter", () => explain(piece));
          token.addEventListener("focus", () => explain(piece));
          token.addEventListener("click", () => explain(piece));
          output.appendChild(token);
        });
        if (pieces[0]) explain(pieces[0]);
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          input.value = button.dataset.sentence;
          update();
        });
      });
      input.addEventListener("input", () => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
        update();
      });
      update();
    });
  }

  function initTemperature() {
    document.querySelectorAll("[data-temp-widget]").forEach((root) => {
      const slider = root.querySelector("input[type='range']");
      const label = root.querySelector("[data-temp-value]");
      const logits = [4.1, 3.2, 2.2, 1.5, .7];
      const names = IT
        ? ["preciso", "utile", "originale", "strano", "falso"]
        : ["precise", "useful", "fresh", "weird", "false"];
      let phase = 0;
      let lastManualChange = 0;
      const update = () => {
        const t = Number(slider.value);
        label.textContent = t.toFixed(1);
        const exps = logits.map((v) => Math.exp(v / t));
        const probs = normalise(exps);
        renderBars(root, names.map((name, i) => ({ name, value: probs[i] })));
        renderTempCurve(root, probs, names);
      };
      slider.addEventListener("input", () => {
        lastManualChange = Date.now();
        update();
      });
      update();
      window.setInterval(() => {
        if (Date.now() - lastManualChange < 6000) return;
        phase += .32;
        slider.value = (1.1 + Math.sin(phase) * .85).toFixed(1);
        update();
      }, 900);
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

  window.addEventListener("DOMContentLoaded", () => {
    initNextToken();
    initTokenizerWidget();
    initTemperature();
    initReasoningWidget();
  });
})();
