// Adds ?v=<content hash> to the local CSS and JS links of the Polish pages, so a deploy never
// pairs new HTML with a stylesheet or script the browser still has cached (GitHub Pages serves
// them with max-age=600). Run before build-en.mjs, which copies the links into the English pages.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site');

// The QR pages under /cukierniazalewski*/ are versioned by the QRs project, not here.
export const versionedPages = ['site/index.html', 'site/prezentacja/index.html', 'site/privacy/index.html'];

// A module's hash covers the files it imports, so editing a helper also changes the entry's URL.
function collect(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  if (file.endsWith('.js')) {
    const code = fs.readFileSync(file, 'utf8');
    for (const [, spec] of code.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      collect(path.resolve(path.dirname(file), spec), seen);
    }
  }
  return seen;
}

function hashOf(file) {
  const h = crypto.createHash('sha256');
  for (const f of [...collect(file)].sort()) h.update(f).update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 10);
}

export function versionAssets() {
  const changed = [];
  for (const page of versionedPages) {
    const pageFile = path.join(root, page);
    const html = fs.readFileSync(pageFile, 'utf8');
    const next = html.replace(
      /(\s(?:href|src)=")((?!https?:|\/\/)[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"/g,
      (_, attr, url) => {
        const file = url.startsWith('/') ? path.join(site, url) : path.resolve(path.dirname(pageFile), url);
        if (!fs.existsSync(file)) throw new Error(`${page}: ${url} does not exist`);
        return `${attr}${url}?v=${hashOf(file)}"`;
      },
    );
    if (next !== html) {
      fs.writeFileSync(pageFile, next);
      changed.push(page);
    }
  }
  return changed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const changed = versionAssets();
  console.log(changed.length ? `versioned ${changed.join(', ')}` : 'asset versions up to date');
}
