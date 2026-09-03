#!/usr/bin/env node
/**
 * apply-notes.mjs — merge a note patch exported from the offline deck back into
 * the module sources.
 *
 * The deck's note editor (file:// only) keeps edits in the browser and exports
 * them as `notes-<lang>.json`, keyed by the build-time `data-nid`
 * (`<module stem>#<child index>`). This script recomputes the same indexing on
 * the source fragments and replaces the matching `<aside class="notes">`, so an
 * edit made after a lesson survives the next `node build.mjs`.
 *
 *   node tools/apply-notes.mjs notes-it.json          # apply
 *   node tools/apply-notes.mjs notes-it.json --dry    # show what would change
 *
 * The patch names its own language, so it always lands in modules/ (en) or
 * modules/it/ (it) and never in the wrong one. Slides are matched by id, not by
 * position: an id that no longer exists is reported rather than applied, so
 * reordering a module cannot silently move a note onto the wrong slide.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [patchArg, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry');
if (!patchArg) {
  console.error('usage: node tools/apply-notes.mjs <notes-*.json> [--dry]');
  process.exit(1);
}

const patch = JSON.parse(await readFile(resolve(patchArg), 'utf8'));
const lang = patch.lang === 'it' ? 'it' : 'en';
const dir = lang === 'it' ? join(root, 'modules', 'it') : join(root, 'modules');
const entries = Object.entries(patch.notes || {});
if (!entries.length) { console.log('patch is empty.'); process.exit(0); }

const byFile = new Map();
for (const [nid, html] of entries) {
  const [stem, idx] = nid.split('#');
  if (!byFile.has(stem)) byFile.set(stem, []);
  byFile.get(stem).push([Number(idx), html, nid]);
}

let applied = 0;
const missed = [];
for (const [stem, items] of byFile) {
  const file = join(dir, `${stem}.html`);
  let src;
  try { src = await readFile(file, 'utf8'); }
  catch { missed.push(...items.map(i => i[2])); continue; }

  // The same child-section indexing build.mjs uses to stamp data-nid.
  const starts = [...src.matchAll(/^  <section/gm)].map(m => m.index);
  const end = src.lastIndexOf('</section>');
  const bounds = [...starts, end];
  let out = src, shift = 0;
  for (const [idx, html, nid] of items.sort((a, b) => a[0] - b[0])) {
    if (idx >= starts.length) { missed.push(nid); continue; }
    const a = bounds[idx] + shift, b = bounds[idx + 1] + shift;
    const block = out.slice(a, b);
    const indented = String(html).trim().split('\n')
      .map(l => (l.trim() ? '      ' + l.trim() : '')).join('\n');
    const replacement = `    <aside class="notes">\n${indented}\n    </aside>\n`;
    const next = /^ *<aside class="notes">[\s\S]*?<\/aside>\n/m.test(block)
      ? block.replace(/^ *<aside class="notes">[\s\S]*?<\/aside>\n/m, replacement)
      : block.replace(/(\n  <\/section>)/, `\n${replacement}  </section>`);
    if (next === block) { missed.push(nid); continue; }
    out = out.slice(0, a) + next + out.slice(b);
    shift += next.length - block.length;
    applied += 1;
  }
  if (!dry && out !== src) await writeFile(file, out, 'utf8');
  console.log(`${dry ? '[dry] ' : ''}${stem}.html — ${items.length} note(s)`);
}

console.log(`${dry ? 'would apply' : 'applied'} ${applied}/${entries.length} note(s) to modules${lang === 'it' ? '/it' : ''}/`);
if (missed.length) console.warn(`not found (slide id gone?): ${missed.join(', ')}`);
if (!dry) console.log('now run: node build.mjs');
