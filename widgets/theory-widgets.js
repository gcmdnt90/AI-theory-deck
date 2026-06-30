(() => {
  const tokenSets = [
    ["model", "agent", "token", "answer", "source"],
    ["checks", "retrieves", "samples", "routes", "waits"],
    ["now", "next", "well", "again", "carefully"]
  ];

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

  function renderTempCurve(root, probs) {
    const svg = root.querySelector("[data-temp-distribution]");
    if (!svg) return;
    const width = 520;
    const height = 145;
    const padX = 34;
    const baseY = 118;
    const usableW = width - padX * 2;
    const maxP = Math.max(...probs, 0.01);
    const points = probs.map((p, i) => {
      const x = padX + (usableW * i) / (probs.length - 1);
      const y = baseY - (p / maxP) * 82;
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
      <line x1="${padX}" y1="${baseY}" x2="${width - padX}" y2="${baseY}" stroke-width="1"/>
      <path d="${area}"></path>
      ${points.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 5 : 4}" fill="${i === 0 ? "var(--ait-amber)" : "var(--ait-cyan)"}"></circle>`).join("")}
    `;
  }

  function initNextToken() {
    document.querySelectorAll("[data-next-token-widget]").forEach((root) => {
      const input = root.querySelector("input");
      const update = () => {
        const text = input.value.trim();
        const set = tokenSets[text.length % tokenSets.length];
        const seed = Array.from(text).reduce((acc, ch) => acc + ch.charCodeAt(0), 17);
        const raw = set.map((_, i) => 1 / (1 + ((seed + i * 7) % 13)));
        const probs = normalise(raw).sort((a, b) => b - a);
        renderBars(root, set.map((name, i) => ({ name, value: probs[i] })));
      };
      input.addEventListener("input", update);
      update();
    });
  }

  function initTemperature() {
    document.querySelectorAll("[data-temp-widget]").forEach((root) => {
      const slider = root.querySelector("input[type='range']");
      const label = root.querySelector("[data-temp-value]");
      const logits = [4.1, 3.2, 2.2, 1.5, .7];
      const names = ["precise", "useful", "fresh", "weird", "false"];
      let phase = 0;
      let lastManualChange = 0;
      const update = () => {
        const t = Number(slider.value);
        label.textContent = t.toFixed(1);
        const exps = logits.map((v) => Math.exp(v / t));
        const probs = normalise(exps);
        renderBars(root, names.map((name, i) => ({ name, value: probs[i] })));
        renderTempCurve(root, probs);
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
      const modes = {
        trained: {
          copy: "Inside the model: post-training changes behaviour by updating parameters or policies. The ability is carried forward without re-sending a prompt trick.",
          svg: `
            <svg viewBox="0 0 520 180" role="img" aria-label="Trained reasoning is inside the model">
              <rect x="70" y="52" width="160" height="76" rx="18" fill="rgba(21,151,181,.12)" stroke="#1597b5" stroke-width="2"/>
              <text x="150" y="96" text-anchor="middle" class="label">training</text>
              <path d="M240 90 H292" stroke="#e3a12f" stroke-width="3"/>
              <rect x="304" y="38" width="150" height="104" rx="20" fill="rgba(21,151,181,.16)" stroke="#1597b5" stroke-width="2.3"/>
              <text x="379" y="82" text-anchor="middle" class="label">model</text>
              <text x="379" y="111" text-anchor="middle" class="mono-label">changed weights</text>
            </svg>`
        },
        prompted: {
          copy: "Around the model: the weights stay fixed. We supply an external scaffold, such as steps, examples, tools or a loop, each time we need the behaviour.",
          svg: `
            <svg viewBox="0 0 520 180" role="img" aria-label="Prompted reasoning wraps a frozen model">
              <rect x="190" y="50" width="140" height="80" rx="18" fill="rgba(21,151,181,.12)" stroke="#1597b5" stroke-width="2"/>
              <text x="260" y="84" text-anchor="middle" class="label">model</text>
              <text x="260" y="112" text-anchor="middle" class="mono-label">frozen</text>
              <path d="M115 92 C115 30, 405 30, 405 92 S115 154, 115 92" fill="none" stroke="#8366c8" stroke-width="2.4" stroke-dasharray="7 7"/>
              <circle cx="115" cy="92" r="20" fill="rgba(227,161,47,.15)" stroke="#e3a12f"/>
              <circle cx="405" cy="92" r="20" fill="rgba(131,102,200,.14)" stroke="#8366c8"/>
              <path d="M135 92 H180M340 92 H385" stroke="#e3a12f" stroke-width="2.4"/>
            </svg>`
        }
      };
      const update = (mode) => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
        copy.textContent = modes[mode].copy;
        diagram.innerHTML = modes[mode].svg;
      };
      buttons.forEach((button) => button.addEventListener("click", () => update(button.dataset.mode)));
      update("trained");
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    initNextToken();
    initTemperature();
    initReasoningWidget();
  });
})();
