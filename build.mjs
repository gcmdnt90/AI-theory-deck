#!/usr/bin/env node
/**
 * build.mjs — assemble a single, self-contained bilingual index.html.
 *
 * Why a build step: authoring each module as its own file keeps the source
 * modular and reviewable, while the generated index.html stays one file that
 * opens straight from the filesystem (file://) with no server — important for
 * offline lecture-hall use and for the recorded lesson.
 *
 * Languages: modules/*.html is the English source; modules/it/*.html is the
 * Italian 1:1 translation (same filenames, same slide structure — content is
 * frozen across languages for research consistency). BOTH decks are inlined
 * into a single index.html inside inert <template> elements; a language toggle
 * in the page swaps the active deck at runtime and remembers the choice.
 * This means GitHub Pages always serves index.html regardless of language.
 *
 * Usage:  node build.mjs          (from the theory-deck/ directory)
 */
import { readFile, writeFile, readdir, access, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

async function assembleDeck(modulesDir, label) {
  try {
    await access(modulesDir);
  } catch {
    throw new Error(`[${label}] ${modulesDir} not found.`);
  }
  // Modules are ordered by their numeric filename prefix (00-, 01-, ... 99-).
  const files = (await readdir(modulesDir, { withFileTypes: true }))
    .filter(d => d.isFile() && d.name.endsWith('.html'))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) throw new Error(`[${label}] no module fragments in ${modulesDir}.`);

  const parts = [];
  for (const f of files) {
    let html = await readFile(join(modulesDir, f), 'utf8');
    // Stamp a stable note id on every child <section>: modulestem#index.
    // The offline note editor exports edits keyed by it, and tools/apply-notes.mjs
    // merges them back into modules/ by the same key - so an edit made in the
    // browser survives the next `node build.mjs` instead of being overwritten.
    const stem = f.replace(/\.html$/, '');
    let n = -1;
    html = html.replace(/^  <section(?![^>]*data-nid)/gm, () => {
      n += 1;
      return `  <section data-nid="${stem}#${n}"`;
    });
    parts.push(`\n<!-- ===== ${f} ===== -->\n${html.trim()}\n`);
  }
  console.log(`[${label}] ${files.length} fragment(s): ${files.join(', ')}`);
  return parts.join('\n');
}

/* ------------------------------------------------------------------ *
 * Demo resources shipped WITH the deck.
 *
 * The point is that a lesson needs no preparation on the machine: open the
 * deck (from GitHub Pages or from this folder), pick the sector, and every
 * file a demo needs is one click away - the raw notes to paste, the chain's
 * handover artefacts, the house documents, the records folder, the poisoned
 * folder. So build.mjs copies delivery/demo-data/<settore>/ into files/ and
 * writes one zip for the whole pack plus one per top-level folder.
 *
 * The zip is written here, store-only, with no dependency: `node build.mjs`
 * has to stay the only command, on any machine, and the pack is ~130 KB of
 * PDFs that compress to almost nothing anyway.
 * ------------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function zipStore(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x2100, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(e.data.length, 18); lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    local.push(lh, name, e.data);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(0, 10); cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0x2100, 14); cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(e.data.length, 20); cd.writeUInt32LE(e.data.length, 24);
    cd.writeUInt16LE(name.length, 28); cd.writeUInt32LE(0, 30); cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36); cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offset, 42);
    central.push(cd, name);
    offset += lh.length + name.length + e.data.length;
  }
  const cdBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cdBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cdBuf, end]);
}

async function walk(dir, base = dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    if (d.name.startsWith('.') || d.name === '__pycache__') continue;
    const full = join(dir, d.name);
    if (d.isDirectory()) out.push(...await walk(full, base));
    else out.push({ name: relative(base, full).split(sep).join('/'), full });
  }
  return out;
}

async function syncDemoFiles() {
  const src = join(root, '..', 'demo-data');
  try { await access(src); } catch {
    console.warn('[files] ../demo-data not found - the deck will build, but the demo download rail will 404.');
    return;
  }
  const outRoot = join(root, 'files');
  // Best-effort clean rebuild. Some environments (network shares, sandboxed
  // mounts) refuse deletes; overwriting is enough there, at the cost of
  // leaving a stale file behind if the data pack ever shrinks.
  try { await rm(outRoot, { recursive: true, force: true }); }
  catch { console.warn('[files] could not clear files/ - overwriting in place.'); }
  for (const settore of (await readdir(src, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)) {
    const from = join(src, settore);
    const files = await walk(from);
    const entries = [];
    for (const f of files) {
      const data = await readFile(f.full);
      entries.push({ name: f.name, data });
      const dest = join(outRoot, settore, f.name);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, data);
    }
    // Whole pack, then one zip per top-level folder, so "the poisoned folder"
    // is one file and not a scavenger hunt.
    const groups = new Map([['', entries]]);
    for (const e of entries) {
      const top = e.name.includes('/') ? e.name.split('/')[0] : null;
      if (!top) continue;
      if (!groups.has(top)) groups.set(top, []);
      groups.get(top).push(e);
    }
    for (const [top, group] of groups) {
      const zipName = top ? `${settore}-${top}.zip` : `demo-data-${settore}.zip`;
      await writeFile(join(outRoot, zipName), zipStore(group));
    }
    const kb = Math.round(entries.reduce((n, e) => n + e.data.length, 0) / 1024);
    console.log(`[files] ${settore}: ${entries.length} file(s), ${kb} KB, ${groups.size} zip(s).`);
  }
}

await syncDemoFiles();

/* The demo slides can paste their own material: a prompt with `paste_file`
 * shows the real notes instead of a [PASTE …] hole, and the copy button hands
 * over a prompt that is ready to run. The files are inlined for the same reason
 * demo-prompts.json is - the deck has to work from file:// with no server. */
let demoFiles = '{}';
try {
  const src = join(root, '..', 'demo-data');
  const packs = {};
  for (const settore of (await readdir(src, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)) {
    const bag = {};
    for (const sub of ['demo', 'demo/catena']) {
      let names = [];
      try { names = await readdir(join(src, settore, ...sub.split('/'))); } catch { continue; }
      for (const name of names) {
        if (!/\.(md|csv|json|txt)$/i.test(name)) continue;
        if (name.startsWith('LEGGIMI')) continue;   // trainer-only, never pasted
        bag[`${sub}/${name}`] = await readFile(join(src, settore, ...sub.split('/'), name), 'utf8');
      }
    }
    packs[settore] = bag;
  }
  demoFiles = JSON.stringify(packs);
  const kb = Math.round(demoFiles.length / 1024);
  console.log(`[paste] inlined ${Object.values(packs).reduce((n, b) => n + Object.keys(b).length, 0)} text file(s), ${kb} KB.`);
} catch (err) {
  console.warn(`[paste] could not inline demo text files - prompts will keep their [PASTE …] holes.\n        ${err.message}`);
}

// Demo prompts are inlined (not fetched) so the deck still works from file://
// with no server. The demo slides read them from a JSON <script> tag.
let demoPrompts = '{}';
try {
  demoPrompts = await readFile(join(root, 'demo-prompts.json'), 'utf8');
  JSON.parse(demoPrompts); // fail loudly here rather than silently in the room
  console.log('[prompts] demo-prompts.json inlined.');
} catch (err) {
  console.warn(`[prompts] demo-prompts.json missing or invalid — demo slides will be empty.\n         ${err.message}`);
}

/**
 * Two editions are built from the same template:
 *   index.html    — SME edition (modules/), the live URL. Thinned, 5 modules.
 *   academic.html — academic edition (modules-academic/), frozen 9-module
 *                   deck as delivered to UnivPM PhD students. Kept buildable
 *                   so the research instrument alignment is not lost.
 * Both are bilingual; the in-page EN/IT toggle is unchanged.
 */
const editions = [
  { id: 'sme', dir: 'modules', out: 'index.html', label: 'SME edition' },
  { id: 'academic', dir: 'modules-academic', out: 'academic.html', label: 'academic edition' }
];

let template = await readFile(join(root, 'template.html'), 'utf8');

/* Cache-bust the stylesheet and the widgets from their own content.
 *
 * The query string used to be a hand-written constant, and it had not changed
 * in months: a browser that had the deck open kept serving the OLD
 * theory-widgets.js against the NEW index.html, so widget fixes appeared not to
 * work at all - with no error, because the cached file was perfectly valid.
 * Hashing the file means every rebuild changes the URL and nothing else has to
 * be remembered. */
const stamp = async (rel) => {
  try {
    const buf = await readFile(join(root, rel));
    return createHash('sha1').update(buf).digest('hex').slice(0, 10);
  } catch { return String(Date.now()); }
};
for (const rel of ['css/theme.css', 'widgets/theory-widgets.js', 'widgets/bpe-cl100k.js']) {
  const v = await stamp(rel);
  const before = template;
  template = template.replace(new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=[^"\']*'), () => `${rel}?v=${v}`);
  if (before === template) console.warn(`[cache] ${rel} has no ?v= in template.html - it will be served from cache.`);
  else console.log(`[cache] ${rel} -> ?v=${v}`);
}

for (const ed of editions) {
  const base = join(root, ed.dir);
  try {
    await access(base);
  } catch {
    console.warn(`[${ed.id}] ${ed.dir}/ not found — skipping ${ed.out}.`);
    continue;
  }
  const en = await assembleDeck(base, `${ed.id}:en`);
  const it = await assembleDeck(join(base, 'it'), `${ed.id}:it`);

  // Function replacements throughout: slide markup contains $$…$$ (KaTeX) and
  // $-sequences are special in a string replacement, which would silently
  // mangle display math into inline math.
  const out = template
    .replace('{{DECK_EN}}', () => en)
    .replace('{{DECK_IT}}', () => it)
    .replace('{{DEMO_PROMPTS}}', () => demoPrompts)
    .replace('{{DEMO_FILES}}', () => demoFiles)
    .replace(/\{\{EDITION\}\}/g, () => ed.id);

  await writeFile(join(root, ed.out), out, 'utf8');
  console.log(`Built ${ed.out} (${ed.label}, bilingual EN + IT).`);
}

// Legacy redirect: old links to index.it.html still work and land in Italian.
const redirect = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>AI Translator — reindirizzamento</title>
<script>
  // The deck is now a single bilingual index.html. Remember the Italian
  // choice and forward, preserving any slide hash.
  try { localStorage.setItem('deck-lang', 'it'); } catch (e) {}
  location.replace('index.html' + (location.hash || ''));
</script>
</head>
<body>
<p>Il deck è ora un unico <a href="index.html">index.html</a> bilingue. Reindirizzamento…</p>
</body>
</html>
`;
await writeFile(join(root, 'index.it.html'), redirect, 'utf8');
console.log('Wrote index.it.html as a compatibility redirect (→ index.html, Italian).');
