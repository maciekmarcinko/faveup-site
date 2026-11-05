// Writes site/en/index.html from site/index.html and the English dictionary, so English has its
// own crawlable URL (title, description, hreflang) instead of text swapped in by JavaScript.
// Run by `npm run build`, `npm run dev` and `npm run deploy`; never edit site/en/ by hand.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'site/index.html');
const target = path.join(root, 'site/en/index.html');

export async function buildEnglish() {
  // A fresh URL each time so `npm run dev` reruns pick up dictionary edits.
  const { default: en } = await import(`${pathToFileURL(path.join(root, 'i18n/landing.en.mjs'))}?t=${Date.now()}`);
  let html = fs.readFileSync(source, 'utf8');
  const used = new Set();
  const lookup = (key) => {
    if (!(key in en)) throw new Error(`Missing English translation for "${key}"`);
    used.add(key);
    return en[key];
  };

  if (!html.startsWith('<!doctype html>\n<html lang="pl">')) throw new Error('index.html must start with <html lang="pl">');
  html = html.replace('<html lang="pl">', '<html lang="en">');

  // The page moves one folder down: shared files get "../". This runs before translation, so
  // hrefs from the dictionary are taken as written (relative to /en/).
  html = html.replace(/(\s(?:src|href)=")((?:assets|css|js|prezentacja)\/|\.\/")/g, (_, attr, value) =>
    value === './"' ? `${attr}../"` : `${attr}../${value}`,
  );

  const expected = (html.match(/\sdata-i18n="/g) || []).length;
  let replaced = 0;
  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, key, inner) => {
    // The lazy match would stop at a nested element of the same tag.
    if (new RegExp(`<${tag}[\\s>]`).test(inner)) throw new Error(`data-i18n="${key}" contains a nested <${tag}>`);
    replaced += 1;
    return `<${tag}${attrs}>${lookup(key)}</${tag}>`;
  });
  if (replaced !== expected) throw new Error(`Translated ${replaced} of ${expected} data-i18n elements`);

  html = html.replace(/<[a-zA-Z][^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const value = lookup(key).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      const existing = new RegExp(`(\\s${attr}=")[^"]*(")`);
      if (!existing.test(tag)) throw new Error(`data-i18n-attr names ${attr}, which the tag does not have: ${tag}`);
      tag = tag.replace(existing, (_, start, end) => `${start}${value}${end}`);
    }
    return tag;
  });

  const unused = Object.keys(en).filter((key) => !used.has(key));
  if (unused.length) throw new Error(`English keys not used in index.html: ${unused.join(', ')}`);

  html = html.replace(
    '<!doctype html>\n',
    '<!doctype html>\n<!-- Generated from ../index.html and i18n/landing.en.mjs by scripts/build-en.mjs. Do not edit. -->\n',
  );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  return target;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = await buildEnglish();
  console.log(`wrote ${path.relative(root, file)}`);
}
