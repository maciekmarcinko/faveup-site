// Google Analytics behind a cookie banner (GDPR / Polish telecom law). Shared by every public page
// on faveup.app, including the QR signup pages built in ../QRs, so it is a plain script with its
// own styles and both languages built in.
//
// Consent Mode v2 "advanced": the tag always loads, but until the visitor accepts, cookies stay
// denied and Google only gets cookieless pings.
//
// Pages that run ads (the business landing, the /dla-firm/ ad page, the thank-you page and the
// privacy page, where the choice can be changed) load this script with a `data-marketing`
// attribute. Only there the banner also asks about marketing cookies (Google Ads, Meta Pixel, see
// ads.js), as a separate choice. Without the attribute (the QR pages) it asks about analytics only
// and ad signals are never granted.
//
// Pages that load it with `data-cookie-button` show no banner. Instead a floating cookie button in
// the bottom left corner stays until the visitor has chosen, and opens a settings window with one
// switch per cookie category. Pages with `data-marketing` or `data-cookie-button` use that window
// for "Choose" and for `data-cookie-settings` links (the privacy page's "change settings" button,
// the way to change the choice later); the QR pages keep the simple banner.
(() => {
  const MEASUREMENT_ID = 'G-CYXPNEX0P0';
  // Only the live site reports to GA, so local previews never show up as visits.
  const GA_HOSTS = ['www.faveup.app'];
  const STORAGE_KEY = 'faveup-consent';
  const ADS_KEY = 'faveup-consent-ads';
  const withMarketing = document.currentScript.hasAttribute('data-marketing');
  const withButton = document.currentScript.hasAttribute('data-cookie-button');
  const withSettings = withMarketing || withButton;

  const TEXT = {
    pl: {
      label: 'Zgoda na pliki cookie',
      body: 'Używamy plików cookie Google Analytics, żeby sprawdzać, jak odwiedzający korzystają ze strony. Włączymy je tylko, jeśli się zgodzisz.',
      bodyMarketing:
        'Używamy plików cookie Google Analytics oraz reklamowych Google i Meta, żeby wiedzieć, jak działa strona i nasze reklamy. Włączymy je tylko, jeśli się zgodzisz.',
      more: 'Polityka prywatności',
      href: '/privacy/',
      accept: 'Akceptuję',
      reject: 'Odrzucam',
      choose: 'Wybierz, na co się zgadzasz',
      settingsTitle: 'Ustawienia plików cookie',
      settingsIntro: 'Wybierz, na które pliki cookie się zgadzasz. Swój wybór możesz zmienić w każdej chwili.',
      settingsMore: 'Więcej w polityce prywatności',
      necessary: 'Niezbędne',
      always: 'Zawsze aktywne',
      necessaryBody: 'Zapamiętują Twój wybór dotyczący plików cookie i języka strony. Bez nich strona nie działa poprawnie.',
      analytics: 'Statystyki (Google Analytics)',
      analyticsBody: 'Pokazują nam, ile osób odwiedza stronę, skąd przychodzą i z jakich urządzeń korzystają.',
      ads: 'Reklamy (Google Ads, Meta)',
      adsBody: 'Pozwalają sprawdzić, czy ktoś, kto kliknął naszą reklamę, zapisał potem swój lokal. Dzięki temu wiemy, które reklamy działają.',
      rejectAll: 'Odrzuć wszystkie',
      save: 'Zapisz wybór',
      acceptAll: 'Akceptuj wszystkie',
      close: 'Zamknij',
      button: 'Ustawienia plików cookie',
    },
    en: {
      label: 'Cookie consent',
      body: 'We use Google Analytics cookies to see how visitors use this site. We only turn them on if you agree.',
      bodyMarketing:
        'We use Google Analytics and Google and Meta advertising cookies to learn how the site and our ads work. We only turn them on if you agree.',
      more: 'Privacy policy',
      href: '/en/privacy/',
      accept: 'Accept',
      reject: 'Reject',
      choose: 'Choose what you agree to',
      settingsTitle: 'Cookie settings',
      settingsIntro: 'Choose which cookies you agree to. You can change your choice at any time.',
      settingsMore: 'More in the privacy policy',
      necessary: 'Necessary',
      always: 'Always on',
      necessaryBody: 'Remember your cookie choice and the site language. The site does not work properly without them.',
      analytics: 'Statistics (Google Analytics)',
      analyticsBody: 'Show us how many people visit the site, where they come from and which devices they use.',
      ads: 'Advertising (Google Ads, Meta)',
      adsBody: 'Let us see whether someone who clicked one of our ads then signed up their place, so we know which ads work.',
      rejectAll: 'Reject all',
      save: 'Save my choice',
      acceptAll: 'Accept all',
      close: 'Close',
      button: 'Cookie settings',
    },
  };

  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode: the banner asks again on the next visit.
    }
  };

  window.dataLayer = window.dataLayer || [];
  // ads.js sends its Google Ads calls through the same tag.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  const { gtag } = window;

  const saved = read(STORAGE_KEY);
  const savedAds = withMarketing ? read(ADS_KEY) : null;
  const adsValue = (value) => ({ ad_storage: value, ad_user_data: value, ad_personalization: value });
  gtag('consent', 'default', {
    analytics_storage: saved === 'granted' ? 'granted' : 'denied',
    ...adsValue(savedAds === 'granted' ? 'granted' : 'denied'),
  });
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  // ads.js reads the current marketing choice here and listens for 'faveup-consent' changes.
  window.faveupConsent = { marketing: savedAds === 'granted' };

  if (GA_HOSTS.includes(location.hostname)) {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(tag);
  }

  // Google and Meta set their cookies on the parent domain, so both are cleared when consent is
  // withdrawn.
  const clearCookies = (pattern) => {
    const domains = ['', location.hostname, location.hostname.replace(/^www\./, '.')];
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
      if (!pattern.test(name)) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }
    }
  };
  const GA_COOKIES = /^_ga/;
  const AD_COOKIES = /^(_gcl|_fbp|_fbc)/;

  // The old Figma site ran this same tag without asking, so returning visitors can still carry its
  // cookies. Without consent they must not stay.
  if (saved !== 'granted') clearCookies(GA_COOKIES);
  if (withMarketing && savedAds !== 'granted') clearCookies(AD_COOKIES);

  const decided = (value) => value === 'granted' || value === 'denied';
  // Visitors who only answered the analytics question (on a QR page, or before ads existed) are
  // asked once more on a page that runs ads.
  const answered = () => decided(read(STORAGE_KEY)) && (!withMarketing || decided(read(ADS_KEY)));

  const choose = (analytics, ads) => {
    const wasGranted = read(STORAGE_KEY) === 'granted';
    write(STORAGE_KEY, analytics);
    gtag('consent', 'update', { analytics_storage: analytics });
    if (analytics === 'denied') clearCookies(GA_COOKIES);
    if (withMarketing) {
      write(ADS_KEY, ads);
      gtag('consent', 'update', adsValue(ads));
      if (ads === 'denied') clearCookies(AD_COOKIES);
      window.faveupConsent.marketing = ads === 'granted';
    }
    // The load's page_view went out before consent, as a cookieless ping that GA does not report.
    // Most visitors see a single page (the landing, a QR signup), so re-send it once they accept.
    if (analytics === 'granted' && !wasGranted) gtag('event', 'page_view');
    document.dispatchEvent(new CustomEvent('faveup-consent', { detail: { analytics: analytics === 'granted', marketing: window.faveupConsent.marketing } }));
    hide();
    if (dialog && dialog.open) dialog.close();
    updateButton();
  };

  const css = `
.fu-consent{position:fixed;z-index:1000;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;padding:18px 20px;
border-radius:18px;background:#fff;color:#111827;border:1px solid rgb(17 24 39 / .08);
box-shadow:0 24px 60px -20px rgb(16 24 40 / .35);font:400 14px/1.5 'DM Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
animation:fu-consent-in .35s cubic-bezier(.22,1,.36,1)}
.fu-consent[hidden],.fu-consent [hidden],.fu-cookie-button[hidden]{display:none}
.fu-consent p,.fu-cookies p{margin:0}
.fu-consent a,.fu-cookies a{color:#0b5249;text-decoration:underline;text-underline-offset:2px}
.fu-consent__actions{display:flex;gap:10px;margin-top:14px}
.fu-consent__btn{flex:1;min-height:44px;padding:10px 18px;border-radius:999px;border:1.5px solid #36d6c6;font-family:inherit;font-size:15px;font-weight:600;line-height:1.2;cursor:pointer;transition:background-color .2s,color .2s}
.fu-consent__btn--accept{background:#36d6c6;color:#fff}
.fu-consent__btn--accept:hover{background:#2ac4b4;border-color:#2ac4b4}
.fu-consent__btn--reject{background:#fff;color:#0b5249}
.fu-consent__btn--reject:hover{background:#f1fcfa}
.fu-consent__btn:focus-visible,.fu-consent__link:focus-visible,.fu-cookies__close:focus-visible,.fu-cookies a:focus-visible,.fu-consent a:focus-visible{outline:3px solid #0b5249;outline-offset:2px}
.fu-consent__link{display:block;margin:12px auto 0;padding:4px 8px;border:0;background:none;color:#0b5249;font:inherit;font-weight:600;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
@media (max-width:359px){.fu-consent{left:8px;right:8px;bottom:8px;padding:16px}.fu-consent__actions{flex-direction:column}}
@keyframes fu-consent-in{from{opacity:0;transform:translateY(12px)}}

.fu-cookie-button{position:fixed;z-index:900;left:16px;bottom:16px;display:grid;place-items:center;width:52px;height:52px;padding:0;border:0;border-radius:50%;
background:#36d6c6;color:#0b5249;box-shadow:0 10px 24px -8px rgb(16 24 40 / .45),0 0 0 3px rgb(255 255 255 / .9);cursor:pointer;
transition:transform .2s cubic-bezier(.22,1,.36,1),background-color .2s;animation:fu-consent-in .35s cubic-bezier(.22,1,.36,1)}
.fu-cookie-button:hover{background:#2ac4b4;transform:scale(1.06)}
.fu-cookie-button:focus-visible{outline:3px solid #0b5249;outline-offset:3px}
.fu-cookie-button svg{width:26px;height:26px}
@media (max-width:639px){.fu-cookie-button{left:12px;bottom:12px;width:44px;height:44px}.fu-cookie-button svg{width:22px;height:22px}}

.fu-cookies{width:min(600px,calc(100% - 32px));max-width:none;max-height:calc(100% - 32px);margin:auto;padding:0;border:0;border-radius:20px;background:#fff;color:#111827;
box-shadow:0 24px 60px -20px rgb(16 24 40 / .45);font:400 14px/1.5 'DM Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
animation:fu-consent-in .3s cubic-bezier(.22,1,.36,1)}
.fu-cookies[open]{display:flex;flex-direction:column}
.fu-cookies::backdrop{background:rgb(15 23 42 / .5)}
.fu-cookies__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 12px 12px 20px;border-bottom:1px solid rgb(17 24 39 / .08)}
.fu-cookies__head h2{margin:0;font-size:19px;font-weight:600;line-height:1.3}
.fu-cookies__close{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:none;color:#4b5563;cursor:pointer}
.fu-cookies__close:hover{background:#f1fcfa;color:#0b5249}
.fu-cookies__close svg{width:20px;height:20px}
.fu-cookies__body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px 20px 4px;overscroll-behavior:contain}
.fu-cookies__cat{padding:14px 0;border-top:1px solid rgb(17 24 39 / .08)}
.fu-cookies__intro + .fu-cookies__cat{margin-top:14px}
.fu-cookies__row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:32px}
label.fu-cookies__row{cursor:pointer}
.fu-cookies__row strong{font-size:15px;font-weight:600}
.fu-cookies__cat p{margin-top:4px;color:#4b5563}
.fu-cookies__always{flex:none;color:#0d7a70;font-size:13px;font-weight:600}
.fu-cookies input[role=switch]{appearance:none;-webkit-appearance:none;position:relative;flex:none;width:46px;height:28px;margin:0;border-radius:999px;background:#8b95a5;cursor:pointer;transition:background-color .2s}
.fu-cookies input[role=switch]::before{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgb(0 0 0 / .25);transition:transform .2s cubic-bezier(.22,1,.36,1)}
.fu-cookies input[role=switch]:checked{background:#0d9488}
.fu-cookies input[role=switch]:checked::before{transform:translateX(18px)}
.fu-cookies input[role=switch]:focus-visible{outline:3px solid #0b5249;outline-offset:2px}
.fu-cookies__actions{display:flex;gap:10px;padding:14px 20px 18px;border-top:1px solid rgb(17 24 39 / .08)}
.fu-cookies__actions .fu-consent__btn{padding:10px 12px}
@media (max-width:639px){.fu-cookies__actions{flex-direction:column-reverse}}
@media (max-width:359px){.fu-cookies{width:calc(100% - 16px);max-height:calc(100% - 16px)}.fu-cookies__head{padding-left:16px}.fu-cookies__body{padding:14px 16px 4px}.fu-cookies__actions{padding:12px 16px 16px}}
@media (prefers-reduced-motion:reduce){.fu-consent,.fu-cookie-button,.fu-cookies{animation:none}.fu-cookie-button,.fu-cookies input[role=switch],.fu-cookies input[role=switch]::before{transition:none}}
@media print{.fu-consent,.fu-cookie-button{display:none}}`;

  // Lucide icons (ISC): cookie and x.
  const ICON_COOKIE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`;
  const ICON_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  let styled = false;
  let banner = null;
  let dialog = null;
  let button = null;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'pl');

  const addStyles = () => {
    if (styled) return;
    styled = true;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    // The QR pages switch language in place, so everything follows <html lang>.
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };

  function render() {
    const t = TEXT[lang()];
    for (const root of [banner, dialog, button]) {
      if (!root) continue;
      for (const el of root.querySelectorAll('[data-t]')) el.textContent = t[el.dataset.t];
      for (const el of root.querySelectorAll('[data-t-href]')) el.href = t[el.dataset.tHref];
      for (const el of [root, ...root.querySelectorAll('[data-t-label]')]) {
        if (el.dataset.tLabel) el.setAttribute('aria-label', t[el.dataset.tLabel]);
      }
    }
    if (banner) banner.querySelector('[data-consent-body]').textContent = `${withMarketing ? t.bodyMarketing : t.body} `;
    if (button) button.title = t.button;
  }

  const buildBanner = () => {
    addStyles();
    banner = document.createElement('section');
    banner.className = 'fu-consent';
    banner.setAttribute('role', 'region');
    banner.dataset.tLabel = 'label';
    banner.hidden = true;
    banner.innerHTML = `<p><span data-consent-body></span><a data-t="more" data-t-href="href"></a>.</p>
<div class="fu-consent__actions">
<button type="button" class="fu-consent__btn fu-consent__btn--reject" data-consent="denied" data-t="reject"></button>
<button type="button" class="fu-consent__btn fu-consent__btn--accept" data-consent="granted" data-t="accept"></button>
</div>${withSettings ? '<button type="button" class="fu-consent__link" data-consent-choose data-t="choose"></button>' : ''}`;
    for (const el of banner.querySelectorAll('[data-consent]')) {
      el.addEventListener('click', () => choose(el.dataset.consent, el.dataset.consent));
    }
    if (withSettings) banner.querySelector('[data-consent-choose]').addEventListener('click', openSettings);
    document.body.appendChild(banner);
    render();
  };

  // One switch per optional category; the ads one only where the page runs ads.
  const category = (kind) => `<div class="fu-cookies__cat">
<label class="fu-cookies__row"><strong data-t="${kind}"></strong><input type="checkbox" role="switch" data-cookies-kind="${kind}" aria-describedby="fu-cookies-${kind}" /></label>
<p id="fu-cookies-${kind}" data-t="${kind}Body"></p>
</div>`;

  const buildDialog = () => {
    addStyles();
    dialog = document.createElement('dialog');
    dialog.className = 'fu-cookies';
    dialog.setAttribute('aria-labelledby', 'fu-cookies-title');
    dialog.innerHTML = `<div class="fu-cookies__head">
<h2 id="fu-cookies-title" data-t="settingsTitle"></h2>
<button type="button" class="fu-cookies__close" data-cookies-close data-t-label="close">${ICON_X}</button>
</div>
<div class="fu-cookies__body">
<p class="fu-cookies__intro"><span data-t="settingsIntro"></span> <a data-t="settingsMore" data-t-href="href"></a>.</p>
<div class="fu-cookies__cat">
<div class="fu-cookies__row"><strong data-t="necessary"></strong><span class="fu-cookies__always" data-t="always"></span></div>
<p data-t="necessaryBody"></p>
</div>
${category('analytics')}${withMarketing ? category('ads') : ''}
</div>
<div class="fu-cookies__actions">
<button type="button" class="fu-consent__btn fu-consent__btn--reject" data-cookies-all="denied" data-t="rejectAll"></button>
<button type="button" class="fu-consent__btn fu-consent__btn--reject" data-cookies-save data-t="save"></button>
<button type="button" class="fu-consent__btn fu-consent__btn--accept" data-cookies-all="granted" data-t="acceptAll"></button>
</div>`;
    dialog.querySelector('[data-cookies-close]').addEventListener('click', closeSettings);
    for (const el of dialog.querySelectorAll('[data-cookies-all]')) {
      el.addEventListener('click', () => choose(el.dataset.cookiesAll, el.dataset.cookiesAll));
    }
    dialog.querySelector('[data-cookies-save]').addEventListener('click', () => {
      const value = (kind) => (dialog.querySelector(`[data-cookies-kind="${kind}"]`)?.checked ? 'granted' : 'denied');
      choose(value('analytics'), value('ads'));
    });
    // A click on the dimmed area around the window closes it.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeSettings();
    });
    // Escape closes the window natively. The 'close' event is not reliable in every browser, so
    // the follow-up also runs right after the cancel.
    dialog.addEventListener('cancel', () => setTimeout(afterClose));
    dialog.addEventListener('close', afterClose);
    document.body.appendChild(dialog);
    render();
  };

  function openSettings() {
    if (!dialog) buildDialog();
    for (const input of dialog.querySelectorAll('[data-cookies-kind]')) {
      input.checked = read(input.dataset.cookiesKind === 'ads' ? ADS_KEY : STORAGE_KEY) === 'granted';
    }
    hide();
    if (button) button.hidden = true;
    if (!dialog.open) dialog.showModal();
  }

  function closeSettings() {
    if (dialog.open) dialog.close();
    afterClose();
  }
  // Closed without a choice: a visitor who has not answered yet gets the banner (or, on pages with
  // the floating button, the button) back.
  function afterClose() {
    if (dialog.open) return;
    if (!answered() && !withButton) show();
    updateButton();
  }

  const buildButton = () => {
    addStyles();
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'fu-cookie-button';
    button.dataset.tLabel = 'button';
    button.hidden = true;
    button.innerHTML = ICON_COOKIE;
    button.addEventListener('click', openSettings);
    document.body.appendChild(button);
    render();
  };

  // The floating button stands in for the banner: it stays until the visitor has chosen, then goes.
  function updateButton() {
    if (!button) return;
    button.hidden = answered() || (dialog && dialog.open);
  }

  const show = () => {
    if (!banner) buildBanner();
    banner.hidden = false;
    updateButton();
  };
  function hide() {
    if (banner) banner.hidden = true;
  }

  const start = () => {
    // Links and buttons marked data-cookie-settings (privacy page, footer) reopen the choice.
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      event.preventDefault();
      if (withSettings) openSettings();
      else show();
    });
    // Pages with the floating button ask only through it; the others show the banner.
    if (withButton) buildButton();
    else if (!answered()) show();
    updateButton();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
