#!/usr/bin/env node
/**
 * build.mjs — concatenate module fragments into a single self-contained index.html.
 *
 * Why a build step: authoring each module as its own file keeps the source
 * modular and reviewable, while the generated index.html stays a single file
 * that opens straight from the filesystem (file://) with no server — important
 * for offline lecture-hall use and for the recorded lesson.
 *
 * Usage:  node build.mjs          (from the theory-deck/ directory)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const modulesDir = join(root, 'modules');

// Modules are ordered by their numeric filename prefix (00-, 01-, ... 99-).
const files = (await readdir(modulesDir))
  .filter(f => f.endsWith('.html'))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.error('No module fragments found in modules/. Nothing to build.');
  process.exit(1);
}

const parts = [];
for (const f of files) {
  const html = await readFile(join(modulesDir, f), 'utf8');
  parts.push(`\n<!-- ===== ${f} ===== -->\n${html.trim()}\n`);
}

const template = await readFile(join(root, 'template.html'), 'utf8');
const out = template.replace('{{MODULES}}', parts.join('\n'));
await writeFile(join(root, 'index.html'), out, 'utf8');

console.log(`Built index.html from ${files.length} fragment(s):`);
for (const f of files) console.log('  • ' + f);
