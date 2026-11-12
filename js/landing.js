import { attribution, rememberLead, setupAds } from './ads.js';
import { setupLangLinks } from './lang-links.js';
import { setupPlayer } from './phone-player.js';

// The waitlist inbox the Figma site already used.
const FORMSPREE_URL = 'https://formspree.io/f/xwlezeap';
// Business sign-ups continue on the thank-you page, where the lead is counted for the ads.
const THANKS_URL = { pl: '/dziekujemy/', en: '/en/dziekujemy/' };

const pageLang = document.documentElement.lang;
setupLangLinks();
setupAds();

// ---------- Business / users views (kept on the old hash routes so existing links work) ----------

const topbar = document.querySelector('[data-topbar]');
// The ad page (/dla-firm/) is built without the users view.
const views = Object.fromEntries(
  [['business', document.getElementById('view-business')], ['users', document.getElementById('view-users')]].filter(([, view]) => view),
);
const player = setupPlayer(document.getElementById('hero-phone'));

function showView(name, { animate } = { animate: true }) {
  for (const [key, view] of Object.entries(views)) {
    const active = key === name;
    view.hidden = !active;
    view.classList.toggle('is-entering', active && animate);
  }
  for (const button of document.querySelectorAll('[data-view-button]')) {
    button.setAttribute('aria-pressed', String(button.dataset.viewButton === name));
  }
  topbar.dataset.viewCurrent = name;
  // Only the page with both views needs the hash; the ad page keeps its URL as the ad set it.
  if (!views.users) return;
  const hash = name === 'users' ? '#/users-view' : '#/business-view';
  if (location.hash !== hash) history.replaceState(null, '', hash);
  if (name !== 'business') player.pause();
}

for (const button of document.querySelectorAll('[data-view-button]')) {
  button.addEventListener('click', () => {
    showView(button.dataset.viewButton);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}
showView(views.users && location.hash.includes('users-view') ? 'users' : 'business', { animate: false });

// "Join" buttons scroll to the form of whichever view is visible.
for (const link of document.querySelectorAll('[data-join]')) {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const current = topbar.dataset.viewCurrent;
    const target = document.getElementById(current === 'users' ? 'waitlist' : 'contact');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.querySelector('input').focus({ preventScroll: true });
  });
}

// In-page anchors would otherwise overwrite the view hash.
for (const link of document.querySelectorAll('.scroll-hint')) {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
}

const onScroll = () => {
  topbar.classList.toggle('is-scrolled', window.scrollY > 100);
  const heroActions = views[topbar.dataset.viewCurrent].querySelector('.hero__actions');
  topbar.classList.toggle('has-cta', heroActions.getBoundingClientRect().bottom < topbar.offsetHeight);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Reveal on scroll ----------

const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px' },
);
for (const el of document.querySelectorAll('.reveal')) revealer.observe(el);

// ---------- Waitlist forms ----------

for (const form of document.querySelectorAll('[data-signup]')) {
  const error = form.querySelector('.signup__error');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    form.classList.add('is-sending');
    const email = form.elements.email.value;
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          source: form.dataset.source,
          language: pageLang,
          ...attribution(),
          _gotcha: form.elements._gotcha.value,
          _subject: 'Nowy lead — FaveUp beta',
        }),
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
    } catch (failure) {
      console.error(failure);
      error.hidden = false;
      form.classList.remove('is-sending');
      return;
    }
    if ('lead' in form.dataset) {
      rememberLead(email, form.dataset.source);
      location.assign(THANKS_URL[pageLang]);
      return;
    }
    // The users' waitlist thanks in place and stays usable for another address.
    form.classList.remove('is-sending');
    form.reset();
    form.nextElementSibling.hidden = false;
  });
}
