// Writes the ad landing pages (site/dla-firm/, site/en/dla-firm/) from the built landing pages, so
// Google and Meta ads point at the business view alone: no users view, no PL/EN switch, nothing
// that pulls a business owner away from signing up. Run after build-en.mjs by `npm run build`,
// `npm run dev` and `npm run deploy`; never edit site/dla-firm/ or site/en/dla-firm/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The area the ads target, shown in the small label above the headline (e.g. 'Dla lokali z
// Brochowa' / 'For places in Brochów'). Empty keeps the landing's own label.
const AD_AREA = { pl: '', en: '' };

const pages = [
  { lang: 'pl', source: 'site/index.html', target: 'site/dla-firm/index.html' },
  { lang: 'en', source: 'site/en/index.html', target: 'site/en/dla-firm/index.html' },
];

function buildPage({ lang, source, target }) {
  let html = fs.readFileSync(path.join(root, source), 'utf8');

  // Marked blocks in site/index.html: the header's view and language switches, and the users view.
  const cuts = html.match(/<!-- ad-page:cut -->[\s\S]*?<!-- \/ad-page:cut -->/g) || [];
  if (cuts.length !== 2) throw new Error(`${source}: expected 2 ad-page:cut blocks, found ${cuts.length}`);
  html = html.replace(/[ \t]*<!-- ad-page:cut -->[\s\S]*?<!-- \/ad-page:cut -->\n?/g, '');

  html = html.replace(/<html lang="(pl|en)">/, '<html lang="$1" data-ad-page>');
  // The landing is the page to index; this one only exists for the ads.
  html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1" />', (tag) => `${tag}\n    <meta name="robots" content="noindex" />`);

  // One folder deeper, so every relative URL gains "../" (as in build-en.mjs).
  html = html.replace(/(\s(?:src|href)=")(?!https?:|mailto:|tel:|#|\/|data:)([^"]*)"/g, (_, attr, value) =>
    `${attr}../${value.replace(/^\.\//, '')}"`,
  );

  if (AD_AREA[lang]) {
    const eyebrow = /(<span data-i18n="hero\.eyebrow">)[^<]*(<\/span>)/;
    if (!eyebrow.test(html)) throw new Error(`${source}: hero eyebrow not found`);
    html = html.replace(eyebrow, `$1${AD_AREA[lang]}$2`);
  }

  html = html.replace(/^(<!doctype html>\n)(<!--[^\n]*-->\n)?/, `$1<!-- Generated from ${source} by scripts/build-ad-page.mjs. Do not edit. -->\n`);
  const file = path.join(root, target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return target;
}

export function buildAdPages() {
  return pages.map(buildPage);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const target of buildAdPages()) console.log(`wrote ${target}`);
}
