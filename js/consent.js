// Google Analytics behind a cookie banner (GDPR / Polish telecom law). Shared by every public page
// on faveup.app, including the QR signup pages built in ../QRs, so it is a plain script with its
// own styles and both languages built in.
//
// Consent Mode v2 "advanced": the tag always loads, but until the visitor accepts, analytics
// cookies stay denied and Google only gets cookieless pings. Ad signals are never granted, because
// the banner only asks about analytics.
(() => {
  const MEASUREMENT_ID = 'G-CYXPNEX0P0';
  // Only the live site reports to GA, so local previews never show up as visits.
  const GA_HOSTS = ['www.faveup.app'];
  const STORAGE_KEY = 'faveup-consent';

  const TEXT = {
    pl: {
      label: 'Zgoda na pliki cookie',
      body: 'Używamy plików cookie Google Analytics, żeby sprawdzać, jak odwiedzający korzystają ze strony. Włączymy je tylko, jeśli się zgodzisz.',
      more: 'Polityka prywatności',
      href: '/privacy/',
      accept: 'Akceptuję',
      reject: 'Odrzucam',
    },
    en: {
      label: 'Cookie consent',
      body: 'We use Google Analytics cookies to see how visitors use this site. We only turn them on if you agree.',
      more: 'Privacy policy',
      href: '/en/privacy/',
      accept: 'Accept',
      reject: 'Reject',
    },
  };

  const read = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const write = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private mode: the banner asks again on the next visit.
    }
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  const saved = read();
  gtag('consent', 'default', {
    analytics_storage: saved === 'granted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  if (GA_HOSTS.includes(location.hostname)) {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(tag);
  }

  // GA sets its cookies on the parent domain, so both are cleared when consent is withdrawn.
  const clearGaCookies = () => {
    const domains = ['', location.hostname, location.hostname.replace(/^www\./, '.')];
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
      if (!/^_ga/.test(name)) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }
    }
  };

  // The old Figma site ran this same tag without asking, so returning visitors can still carry its
  // cookies. Without consent they must not stay.
  if (saved !== 'granted') clearGaCookies();

  const choose = (value) => {
    const wasGranted = read() === 'granted';
    write(value);
    gtag('consent', 'update', { analytics_storage: value });
    if (value === 'denied') clearGaCookies();
    // The load's page_view went out before consent, as a cookieless ping that GA does not report.
    // Most visitors see a single page (the landing, a QR signup), so re-send it once they accept.
    if (value === 'granted' && !wasGranted) gtag('event', 'page_view');
    hide();
  };

  const css = `
.fu-consent{position:fixed;z-index:1000;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;padding:18px 20px;
border-radius:18px;background:#fff;color:#111827;border:1px solid rgb(17 24 39 / .08);
box-shadow:0 24px 60px -20px rgb(16 24 40 / .35);font:400 14px/1.5 'DM Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
animation:fu-consent-in .35s cubic-bezier(.22,1,.36,1)}
.fu-consent[hidden]{display:none}
.fu-consent p{margin:0}
.fu-consent a{color:#0b5249;text-decoration:underline;text-underline-offset:2px}
.fu-consent__actions{display:flex;gap:10px;margin-top:14px}
.fu-consent__btn{flex:1;min-height:44px;padding:10px 18px;border-radius:999px;border:1.5px solid #36d6c6;font-family:inherit;font-size:15px;font-weight:600;line-height:1.2;cursor:pointer;transition:background-color .2s,color .2s}
.fu-consent__btn--accept{background:#36d6c6;color:#fff}
.fu-consent__btn--accept:hover{background:#2ac4b4;border-color:#2ac4b4}
.fu-consent__btn--reject{background:#fff;color:#0b5249}
.fu-consent__btn--reject:hover{background:#f1fcfa}
.fu-consent__btn:focus-visible{outline:3px solid #0b5249;outline-offset:2px}
@media (max-width:359px){.fu-consent{left:8px;right:8px;bottom:8px;padding:16px}.fu-consent__actions{flex-direction:column}}
@keyframes fu-consent-in{from{opacity:0;transform:translateY(12px)}}
@media (prefers-reduced-motion:reduce){.fu-consent{animation:none}}
@media print{.fu-consent{display:none}}`;

  let banner = null;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'pl');

  const render = () => {
    const t = TEXT[lang()];
    banner.setAttribute('aria-label', t.label);
    banner.querySelector('[data-consent-body]').textContent = `${t.body} `;
    const more = banner.querySelector('[data-consent-more]');
    more.textContent = t.more;
    more.href = t.href;
    banner.querySelector('[data-consent="granted"]').textContent = t.accept;
    banner.querySelector('[data-consent="denied"]').textContent = t.reject;
  };

  const build = () => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.className = 'fu-consent';
    banner.setAttribute('role', 'region');
    banner.hidden = true;
    banner.innerHTML = `<p><span data-consent-body></span><a data-consent-more></a>.</p>
<div class="fu-consent__actions">
<button type="button" class="fu-consent__btn fu-consent__btn--reject" data-consent="denied"></button>
<button type="button" class="fu-consent__btn fu-consent__btn--accept" data-consent="granted"></button>
</div>`;
    for (const button of banner.querySelectorAll('[data-consent]')) {
      button.addEventListener('click', () => choose(button.dataset.consent));
    }
    document.body.appendChild(banner);
    render();
    // The QR pages switch language in place, so the banner follows <html lang>.
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };

  const show = () => {
    if (!banner) build();
    banner.hidden = false;
  };
  function hide() {
    if (banner) banner.hidden = true;
  }

  const start = () => {
    // Links and buttons marked data-cookie-settings (privacy page, footer) reopen the banner.
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      event.preventDefault();
      show();
    });
    if (saved !== 'granted' && saved !== 'denied') show();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
