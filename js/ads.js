// Ad measurement for the business pages (landing, /dla-firm/ ad page, /dziekujemy/ thank-you page):
// which ad brought a visitor, and the "lead" conversion when a business signs up.
//
// The ad tags stay off until their IDs are filled in below. Google Ads uses the gtag that
// consent.js already loads (Consent Mode decides what it may store); the Meta Pixel only loads
// after the visitor accepts marketing cookies in the banner. Leads are reported from the
// thank-you page only, once per sign-up, so a reload or a direct visit never counts.

// From Google Ads > Goals > Conversions > the "Lead" action > Tag setup, e.g. 'AW-123456789'.
const GOOGLE_ADS_ID = '';
// The label part of that action's send_to ('AW-123456789/AbCdEf' -> 'AbCdEf').
const GOOGLE_ADS_LEAD_LABEL = '';
// From Meta Events Manager > Data sources > the pixel, e.g. '1234567890123456'.
const META_PIXEL_ID = '';

// Like the GA tag in consent.js: local previews never report to ad platforms.
const LIVE = location.hostname === 'www.faveup.app';
const ATTRIBUTION_KEY = 'faveup-attribution';
const LEAD_KEY = 'faveup-lead';
const CAMPAIGN_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];

const session = {
  get(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode: the sign-up still goes through, only without the ad details.
    }
  },
};

// The first page of a visit that carries campaign parameters is the ad click; later pages of the
// same visit (or a click on another of our ads) keep that first source.
export function captureAttribution() {
  if (session.get(ATTRIBUTION_KEY)) return;
  const params = new URLSearchParams(location.search);
  const found = Object.fromEntries(CAMPAIGN_PARAMS.filter((name) => params.get(name)).map((name) => [name, params.get(name)]));
  session.set(ATTRIBUTION_KEY, {
    ...found,
    landing_page: location.pathname,
    referrer: document.referrer ? new URL(document.referrer).hostname : '',
  });
}

export function attribution() {
  return session.get(ATTRIBUTION_KEY) || {};
}

export function rememberLead(email, source) {
  session.set(LEAD_KEY, { email, source, reported: false });
}

export function currentLead() {
  return session.get(LEAD_KEY);
}

let metaLoaded = false;

function loadMeta() {
  if (metaLoaded || !META_PIXEL_ID) return;
  metaLoaded = true;
  // Meta's standard base code, unminified. fbevents.js replays the queued `arguments` objects.
  const fbq = function () {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
    else fbq.queue.push(arguments);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function whenMarketingAllowed(callback) {
  if (window.faveupConsent.marketing) {
    callback();
    return;
  }
  document.addEventListener('faveup-consent', function listener(event) {
    if (!event.detail.marketing) return;
    document.removeEventListener('faveup-consent', listener);
    callback();
  });
}

export function setupAds() {
  captureAttribution();
  if (!LIVE) return;
  if (GOOGLE_ADS_ID) window.gtag('config', GOOGLE_ADS_ID);
  whenMarketingAllowed(loadMeta);
}

// Called by the thank-you page. Returns false when there is nothing to report.
export function reportLead() {
  const lead = currentLead();
  if (!lead || lead.reported) return false;
  session.set(LEAD_KEY, { ...lead, reported: true });
  window.gtag('event', 'generate_lead', { lead_source: lead.source });
  if (!LIVE) return true;
  if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
    window.gtag('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}` });
  }
  // A visitor who accepts the banner only on this page still counts (setupAds has queued the
  // pixel load ahead of this, so fbq exists by then).
  if (META_PIXEL_ID) whenMarketingAllowed(() => window.fbq('track', 'Lead'));
  return true;
}
