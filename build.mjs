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
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
    const html = await readFile(join(modulesDir, f), 'utf8');
    parts.push(`\n<!-- ===== ${f} ===== -->\n${html.trim()}\n`);
  }
  console.log(`[${label}] ${files.length} fragment(s): ${files.join(', ')}`);
  return parts.join('\n');
}

const en = await assembleDeck(join(root, 'modules'), 'en');
const it = await assembleDeck(join(root, 'modules', 'it'), 'it');

const template = await readFile(join(root, 'template.html'), 'utf8');
const out = template
  .replace('{{DECK_EN}}', en)
  .replace('{{DECK_IT}}', it);

await writeFile(join(root, 'index.html'), out, 'utf8');
console.log('Built index.html (bilingual: EN + IT, toggle in-page).');

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
