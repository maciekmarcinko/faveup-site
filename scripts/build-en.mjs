// Writes the English pages (site/en/...) from the Polish ones and the English dictionaries, so
// English has its own crawlable URLs (title, description, hreflang) instead of text swapped in
// by JavaScript. Run by `npm run build`, `npm run dev` and `npm run deploy`; never edit site/en/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Each English page sits one folder below its Polish source (/x/ -> /en/x/).
const pages = [
  { source: 'site/index.html', target: 'site/en/index.html', dictionary: 'i18n/landing.en.mjs' },
  { source: 'site/prezentacja/index.html', target: 'site/en/prezentacja/index.html', dictionary: 'i18n/deck.en.mjs' },
  { source: 'site/privacy/index.html', target: 'site/en/privacy/index.html', dictionary: 'i18n/privacy.en.mjs' },
];

async function buildPage({ source, target, dictionary }) {
  // A fresh URL each time so `npm run dev` reruns pick up dictionary edits.
  const { default: en } = await import(`${pathToFileURL(path.join(root, dictionary))}?t=${Date.now()}`);
  let html = fs.readFileSync(path.join(root, source), 'utf8');
  const used = new Set();
  const lookup = (key) => {
    if (!(key in en)) throw new Error(`${source}: missing English translation for "${key}"`);
    used.add(key);
    return en[key];
  };

  if (!html.startsWith('<!doctype html>\n<html lang="pl">')) throw new Error(`${source} must start with <html lang="pl">`);
  html = html.replace('<html lang="pl">', '<html lang="en">');

  // One folder deeper, so every relative URL gains "../". This runs before translation, so
  // hrefs from the dictionary are taken as written (relative to the English page).
  html = html.replace(/(\s(?:src|href)=")(?!https?:|mailto:|tel:|#|\/|data:)([^"]*)"/g, (_, attr, value) =>
    `${attr}../${value.replace(/^\.\//, '')}"`,
  );

  const expected = (html.match(/\sdata-i18n="/g) || []).length;
  let replaced = 0;
  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, key, inner) => {
    // The lazy match would stop at a nested element of the same tag.
    if (new RegExp(`<${tag}[\\s>]`).test(inner)) throw new Error(`${source}: data-i18n="${key}" contains a nested <${tag}>`);
    replaced += 1;
    return `<${tag}${attrs}>${lookup(key)}</${tag}>`;
  });
  if (replaced !== expected) throw new Error(`${source}: translated ${replaced} of ${expected} data-i18n elements`);

  html = html.replace(/<[a-zA-Z][^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const value = lookup(key).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      const existing = new RegExp(`(\\s${attr}=")[^"]*(")`);
      if (!existing.test(tag)) throw new Error(`${source}: data-i18n-attr names ${attr}, which the tag does not have: ${tag}`);
      tag = tag.replace(existing, (_, start, end) => `${start}${value}${end}`);
    }
    return tag;
  });

  const unused = Object.keys(en).filter((key) => !used.has(key));
  if (unused.length) throw new Error(`${dictionary}: keys not used in ${source}: ${unused.join(', ')}`);

  html = html.replace(
    '<!doctype html>\n',
    `<!doctype html>\n<!-- Generated from ${source} and ${dictionary} by scripts/build-en.mjs. Do not edit. -->\n`,
  );
  const file = path.join(root, target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return target;
}

export async function buildEnglish() {
  const written = [];
  for (const page of pages) written.push(await buildPage(page));
  return written;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const target of await buildEnglish()) console.log(`wrote ${target}`);
}
