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
(() => {
  const MEASUREMENT_ID = 'G-CYXPNEX0P0';
  // Only the live site reports to GA, so local previews never show up as visits.
  const GA_HOSTS = ['www.faveup.app'];
  const STORAGE_KEY = 'faveup-consent';
  const ADS_KEY = 'faveup-consent-ads';
  const withMarketing = document.currentScript.hasAttribute('data-marketing');

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
      save: 'Zapisz wybór',
      analytics: 'Statystyki (Google Analytics)',
      ads: 'Reklamy (Google Ads, Meta)',
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
      save: 'Save my choice',
      analytics: 'Statistics (Google Analytics)',
      ads: 'Advertising (Google Ads, Meta)',
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
  };

  const css = `
.fu-consent{position:fixed;z-index:1000;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;padding:18px 20px;
border-radius:18px;background:#fff;color:#111827;border:1px solid rgb(17 24 39 / .08);
box-shadow:0 24px 60px -20px rgb(16 24 40 / .35);font:400 14px/1.5 'DM Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
animation:fu-consent-in .35s cubic-bezier(.22,1,.36,1)}
.fu-consent[hidden],.fu-consent [hidden]{display:none}
.fu-consent p{margin:0}
.fu-consent a{color:#0b5249;text-decoration:underline;text-underline-offset:2px}
.fu-consent__actions{display:flex;gap:10px;margin-top:14px}
.fu-consent__btn{flex:1;min-height:44px;padding:10px 18px;border-radius:999px;border:1.5px solid #36d6c6;font-family:inherit;font-size:15px;font-weight:600;line-height:1.2;cursor:pointer;transition:background-color .2s,color .2s}
.fu-consent__btn--accept{background:#36d6c6;color:#fff}
.fu-consent__btn--accept:hover{background:#2ac4b4;border-color:#2ac4b4}
.fu-consent__btn--reject{background:#fff;color:#0b5249}
.fu-consent__btn--reject:hover{background:#f1fcfa}
.fu-consent__btn:focus-visible,.fu-consent__link:focus-visible{outline:3px solid #0b5249;outline-offset:2px}
.fu-consent__link{display:block;margin:12px auto 0;padding:4px 8px;border:0;background:none;color:#0b5249;font:inherit;font-weight:600;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
.fu-consent__choices{display:grid;gap:8px;margin-top:12px}
.fu-consent__choices label{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 12px;border-radius:12px;background:#f1fcfa;cursor:pointer}
.fu-consent__choices input{width:20px;height:20px;accent-color:#0b5249}
@media (max-width:359px){.fu-consent{left:8px;right:8px;bottom:8px;padding:16px}.fu-consent__actions{flex-direction:column}}
@keyframes fu-consent-in{from{opacity:0;transform:translateY(12px)}}
@media (prefers-reduced-motion:reduce){.fu-consent{animation:none}}
@media print{.fu-consent{display:none}}`;

  let banner = null;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'pl');

  const render = () => {
    const t = TEXT[lang()];
    banner.setAttribute('aria-label', t.label);
    banner.querySelector('[data-consent-body]').textContent = `${withMarketing ? t.bodyMarketing : t.body} `;
    const more = banner.querySelector('[data-consent-more]');
    more.textContent = t.more;
    more.href = t.href;
    banner.querySelector('[data-consent="granted"]').textContent = t.accept;
    banner.querySelector('[data-consent="denied"]').textContent = t.reject;
    if (!withMarketing) return;
    banner.querySelector('[data-consent-choose]').textContent = t.choose;
    banner.querySelector('[data-consent-save]').textContent = t.save;
    banner.querySelector('[data-consent-label="analytics"]').textContent = t.analytics;
    banner.querySelector('[data-consent-label="ads"]').textContent = t.ads;
  };

  // With marketing, "Choose" swaps the accept/reject buttons for two checkboxes and "Save".
  const choices = `<div class="fu-consent__choices" data-consent-choices hidden>
<label><input type="checkbox" data-consent-kind="analytics" /><span data-consent-label="analytics"></span></label>
<label><input type="checkbox" data-consent-kind="ads" /><span data-consent-label="ads"></span></label>
<div class="fu-consent__actions"><button type="button" class="fu-consent__btn fu-consent__btn--accept" data-consent-save></button></div>
</div>
<button type="button" class="fu-consent__link" data-consent-choose></button>`;

  const build = () => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.className = 'fu-consent';
    banner.setAttribute('role', 'region');
    banner.hidden = true;
    banner.innerHTML = `<p><span data-consent-body></span><a data-consent-more></a>.</p>
<div class="fu-consent__actions" data-consent-main>
<button type="button" class="fu-consent__btn fu-consent__btn--reject" data-consent="denied"></button>
<button type="button" class="fu-consent__btn fu-consent__btn--accept" data-consent="granted"></button>
</div>${withMarketing ? choices : ''}`;
    for (const button of banner.querySelectorAll('[data-consent]')) {
      button.addEventListener('click', () => choose(button.dataset.consent, button.dataset.consent));
    }
    if (withMarketing) {
      banner.querySelector('[data-consent-choose]').addEventListener('click', () => toggleChoices(true));
      banner.querySelector('[data-consent-save]').addEventListener('click', () => {
        const value = (kind) => (banner.querySelector(`[data-consent-kind="${kind}"]`).checked ? 'granted' : 'denied');
        choose(value('analytics'), value('ads'));
      });
    }
    document.body.appendChild(banner);
    render();
    // The QR pages switch language in place, so the banner follows <html lang>.
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };

  function toggleChoices(open) {
    banner.querySelector('[data-consent-choices]').hidden = !open;
    banner.querySelector('[data-consent-main]').hidden = open;
    banner.querySelector('[data-consent-choose]').hidden = open;
    banner.querySelector('[data-consent-kind="analytics"]').checked = read(STORAGE_KEY) === 'granted';
    banner.querySelector('[data-consent-kind="ads"]').checked = read(ADS_KEY) === 'granted';
  }

  const show = () => {
    if (!banner) build();
    if (withMarketing) toggleChoices(false);
    banner.hidden = false;
  };
  function hide() {
    if (banner) banner.hidden = true;
  }

  const decided = (value) => value === 'granted' || value === 'denied';

  const start = () => {
    // Links and buttons marked data-cookie-settings (privacy page, footer) reopen the banner.
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      event.preventDefault();
      show();
    });
    // Visitors who only answered the analytics question (on a QR page, or before ads existed) are
    // asked once more on a page that runs ads.
    if (!decided(saved) || (withMarketing && !decided(savedAds))) show();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
