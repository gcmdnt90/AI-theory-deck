#!/usr/bin/env node
/**
 * build.mjs — concatenate module fragments into self-contained deck files.
 *
 * Why a build step: authoring each module as its own file keeps the source
 * modular and reviewable, while the generated output stays a single file
 * that opens straight from the filesystem (file://) with no server — important
 * for offline lecture-hall use and for the recorded lesson.
 *
 * Languages: modules/*.html is the English source; modules/it/*.html is the
 * Italian 1:1 translation (same filenames, same slide structure — content is
 * frozen across languages for research consistency). Both variants build into
 * the repo root, so every relative asset path works unchanged:
 *   index.html     ← modules/*.html      (EN)
 *   index.it.html  ← modules/it/*.html   (IT)
 *
 * Usage:  node build.mjs          (from the theory-deck/ directory)
 */
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

const TARGETS = [
  {
    lang: 'en',
    modulesDir: join(root, 'modules'),
    out: join(root, 'index.html'),
    htmlLang: 'en',
    title: 'AI Translator — Theory of Language Models &amp; Agents'
  },
  {
    lang: 'it',
    modulesDir: join(root, 'modules', 'it'),
    out: join(root, 'index.it.html'),
    htmlLang: 'it',
    title: 'AI Translator — Teoria dei modelli linguistici e degli agenti'
  }
];

const template = await readFile(join(root, 'template.html'), 'utf8');

for (const t of TARGETS) {
  try {
    await access(t.modulesDir);
  } catch {
    console.warn(`[${t.lang}] ${t.modulesDir} not found — skipped.`);
    continue;
  }

  // Modules are ordered by their numeric filename prefix (00-, 01-, ... 99-).
  const files = (await readdir(t.modulesDir, { withFileTypes: true }))
    .filter(d => d.isFile() && d.name.endsWith('.html'))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.warn(`[${t.lang}] no module fragments in ${t.modulesDir} — skipped.`);
    continue;
  }

  const parts = [];
  for (const f of files) {
    const html = await readFile(join(t.modulesDir, f), 'utf8');
    parts.push(`\n<!-- ===== ${f} ===== -->\n${html.trim()}\n`);
  }

  let out = template.replace('{{MODULES}}', parts.join('\n'));
  out = out
    .replace('<html lang="en">', `<html lang="${t.htmlLang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${t.title}</title>`);

  await writeFile(t.out, out, 'utf8');
  console.log(`[${t.lang}] built ${t.out} from ${files.length} fragment(s):`);
  for (const f of files) console.log('   • ' + f);
}
