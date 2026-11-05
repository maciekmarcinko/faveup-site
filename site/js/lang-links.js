// Each language is its own static page (/ and /en/, /prezentacja/ and /en/prezentacja/), built by
// scripts/build-en.mjs. The PL/EN links remember the choice, which the inline script in each
// Polish page's <head> uses to send returning English visitors to the English page.

const STORAGE_KEY = 'faveup-lang';

const remember = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
};

export function setupLangLinks() {
  remember(document.documentElement.lang);
  for (const link of document.querySelectorAll('[data-set-lang]')) {
    link.addEventListener('click', (event) => {
      remember(link.dataset.setLang);
      // Keep the current view or slide (#/users-view, #3) when switching language.
      if (location.hash) {
        event.preventDefault();
        location.href = link.getAttribute('href') + location.hash;
      }
    });
  }
}
