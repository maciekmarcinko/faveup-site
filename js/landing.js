import { setupPlayer } from './phone-player.js';

// The waitlist inbox the Figma site already used.
const FORMSPREE_URL = 'https://formspree.io/f/xwlezeap';

// Each language is its own static page (/ and /en/, see scripts/build-en.mjs). The remembered
// choice sends returning English visitors from / to /en/ and opens the deck in the same language.
const pageLang = document.documentElement.lang;
const rememberLang = (lang) => {
  try {
    localStorage.setItem('faveup-lang', lang);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
};
rememberLang(pageLang);
for (const link of document.querySelectorAll('[data-set-lang]')) {
  link.addEventListener('click', (event) => {
    rememberLang(link.dataset.setLang);
    // Keep the business/users view when switching language.
    if (location.hash) {
      event.preventDefault();
      location.href = link.getAttribute('href') + location.hash;
    }
  });
}

// ---------- Business / users views (kept on the old hash routes so existing links work) ----------

const topbar = document.querySelector('[data-topbar]');
const views = { business: document.getElementById('view-business'), users: document.getElementById('view-users') };
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
showView(location.hash.includes('users-view') ? 'users' : 'business', { animate: false });

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
  const heroCta = views[topbar.dataset.viewCurrent].querySelector('.hero__actions [data-join]');
  topbar.classList.toggle('has-cta', heroCta.getBoundingClientRect().bottom < topbar.offsetHeight);
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
  const done = form.nextElementSibling;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    done.hidden = true;
    form.classList.add('is-sending');
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: form.elements.email.value,
          source: form.dataset.source,
          language: pageLang,
          _subject: 'Nowy lead — FaveUp beta',
        }),
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      // The form stays usable for another address, so it starts empty again.
      form.reset();
      done.hidden = false;
    } catch (failure) {
      console.error(failure);
      error.hidden = false;
    } finally {
      form.classList.remove('is-sending');
    }
  });
}
