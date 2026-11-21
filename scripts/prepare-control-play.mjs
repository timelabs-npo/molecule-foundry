#!/usr/bin/env node
/**
 * Stage the offline game at /play/ without modifying the control Worker or the
 * protected Product Design runtime. Run from any cwd; the repository root is
 * resolved from this file. The generated directory is intentionally gitignored.
 * Include public/play in a standalone apps/control Sites source snapshot.
 */
import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'apps/game/dist/native');
const staged = join(root, 'apps/control/public/play');
const built = join(root, 'apps/control/dist/client/play');
const flags = process.argv.slice(2);
if (flags.some(flag => flag !== '--verify')) throw new Error('Supported argument: --verify');
const verify = flags.includes('--verify');
const assetNames = ['game.js', 'game.css'];
const sha256 = data => createHash('sha256').update(data).digest('hex');

const nativeHtml = await readFile(join(source, 'native.html'), 'utf8');
if (!nativeHtml.includes('<head>') || /<base\b/i.test(nativeHtml)) throw new Error('Expected an unmodified native HTML head without an existing base URL.');
const references = [...nativeHtml.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
if (references.length !== 2 || !references.includes('./game.js') || !references.includes('./game.css')) {
  throw new Error('Native entry point changed: review and include all referenced /play/ assets.');
}
if (/<script[^>]+type\s*=\s*["']module["']/i.test(nativeHtml)) throw new Error('The playable game must use the standalone classic IIFE entry point.');
const css = await readFile(join(source, 'game.css'), 'utf8');
const cssUrls = [...css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi)].map(match => match[1]);
if (cssUrls.some(url => !url.startsWith('data:'))) throw new Error('New CSS asset URLs require an explicit bundle update. Do not publish incomplete /play/ assets.');
if (/@import\b/i.test(css)) throw new Error('The offline game stylesheet cannot depend on external imports.');
// The base keeps ./game.js and ./game.css correct for /play, /play/, and SPA
// fallback URLs beneath /play/. This changes only the hosted copy, not iOS.
const html = nativeHtml.replace('<head>', '<head><base href="/play/">');
const expected = new Map([['index.html', Buffer.from(html, 'utf8')]]);
for (const name of assetNames) expected.set(name, await readFile(join(source, name)));
if (/\bprocess\.env\b/.test(expected.get('game.js').toString('utf8'))) {
  throw new Error('Native IIFE still references Node process.env and will crash in a browser. Define process.env.NODE_ENV as production in vite.native.config.ts, then rebuild.');
}
const manifest = {
  schemaVersion: 1,
  bundle: 'molecule-foundry-native-iife',
  mountPath: '/play/',
  sources: ['apps/game/src/native.tsx', 'apps/game/src/Game.tsx', 'packages/engine/src/index.ts'],
  files: [...expected].map(([path, contents]) => ({ path, bytes: contents.length, sha256: sha256(contents) })),
};
expected.set('bundle-manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n', 'utf8'));

if (!verify) {
  // Only replace our generated subtree; preserve control public metadata.
  await rm(staged, { recursive: true, force: true });
  await mkdir(staged, { recursive: true });
  for (const name of assetNames) await copyFile(join(source, name), join(staged, name));
  await writeFile(join(staged, 'index.html'), expected.get('index.html'));
  await writeFile(join(staged, 'bundle-manifest.json'), expected.get('bundle-manifest.json'));
  console.log('Staged playable game at apps/control/public/play/ for Vite and standalone Sites snapshots.');
} else {
  for (const directory of [staged, built]) {
    for (const [name, contents] of expected) {
      const actual = await readFile(join(directory, name));
      if (!actual.equals(contents)) throw new Error(`Stale or altered playable asset: ${join(directory, name)}`);
    }
  }
  for (const entry of ['/play', '/play/', '/play/index.html', '/play/example']) {
    const base = new URL('/play/', `https://example.test${entry}`);
    for (const ref of references) if (!new URL(ref, base).pathname.startsWith('/play/')) throw new Error('A game asset resolves outside /play/.');
  }
  await Promise.all(['client/index.html', 'server/index.js', '.openai/hosting.json'].map(name => access(join(root, 'apps/control/dist', name))));
  console.log('Verified exact /play/ bundle copies, relative asset resolution, and required Sites output files.');
}
