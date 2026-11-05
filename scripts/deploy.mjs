// Publishes site/ (as committed on main) to the gh-pages branch that GitHub Pages serves.
import { execFileSync } from 'node:child_process';
import { buildEnglish } from './build-en.mjs';
import { versionAssets, versionedPages } from './version-assets.mjs';

// Deploy publishes what is committed, so stale asset versions (new HTML with a cached old
// stylesheet) or an uncommitted en/index.html (English that no longer matches the Polish page)
// would ship broken pages.
versionAssets();
await buildEnglish();
const stale = execFileSync('git', ['status', '--porcelain', '--', 'site/en', ...versionedPages], { encoding: 'utf8' });
if (stale) throw new Error(`pages changed after rebuilding; commit them and deploy again:\n${stale}`);

const split = execFileSync('git', ['subtree', 'split', '--prefix', 'site', 'main'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const sha = split.trim().split(/\s+/).pop();

// An empty refspec would turn the push into a deletion of the live branch.
if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`subtree split returned "${sha}", nothing was pushed`);

execFileSync('git', ['push', '--force', 'origin', `${sha}:refs/heads/gh-pages`], { stdio: 'inherit' });
console.log(`gh-pages -> ${sha}`);
