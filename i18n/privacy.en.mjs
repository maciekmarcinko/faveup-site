// English text for site/en/privacy/index.html, generated from site/privacy/index.html by
// scripts/build-en.mjs. Keys match the data-i18n / data-i18n-attr names in the Polish page.
export default {
  'meta.title': 'Privacy policy | FaveUp',
  'meta.description':
    'What data FaveUp collects on faveup.app, why, who it is shared with and what your rights are. Cookies and Google Analytics.',
  'meta.canonical': 'https://www.faveup.app/en/privacy/',

  // The Polish page's relative links are rewritten one folder deeper before these are applied,
  // so these are written relative to /en/privacy/.
  'nav.homeHref': '../',
  'nav.langLabel': 'Language',
  'nav.plHref': '../../privacy/',
  'nav.plCurrent': 'false',
  'nav.enHref': './',
  'nav.enCurrent': 'page',

  title: 'Privacy policy',
  updated: 'Last updated: 5 November 2026',

  'who.title': '1. Who is responsible for your data',
  'who.body':
    'The controller of your personal data is FaveUp. For anything about your data, write to us at <a href="mailto:hello@faveup.app">hello@faveup.app</a>.',

  'what.title': '2. What data we collect and why',

  'waitlist.title': 'Waitlist on the home page',
  'waitlist.body':
    'When you join the waitlist, we collect your email address, the language you chose and whether you signed up as a business or as a user. We use them to tell you when the FaveUp app launches. The legal basis is your consent (Art. 6(1)(a) GDPR). We keep the data until the app launches or until you ask us to delete it.',

  'qr.title': 'Signup pages opened from QR codes in venues',
  'qr.body':
    'When you sign up through a QR code in a partner venue (for example Cukiernia Zalewski), we collect your email address, language, the venue name and the signup date. We use them to send you a discount code and to tell you about the FaveUp launch, under the promotion terms shown on the signup page (Art. 6(1)(b) GDPR). The venue where you signed up can also see its list of signups. We keep the data until the promotion ends and the app launches, or until you ask us to delete it.',

  'stats.title': 'Visit statistics (Google Analytics)',
  'stats.body':
    'Only if you agree, we use Google Analytics to learn which pages are visited, where visitors come from (for example a search engine or a QR code), which devices they use and roughly which country or city they are in. Google Analytics does not store your full IP address. The legal basis is your consent (Art. 6(1)(a) GDPR). Google Analytics deletes the data after 14 months at most.',
  'stats.denied':
    'If you do not agree, Google Analytics stores no cookies. Google then only receives basic cookieless signals (Consent Mode), which cannot identify you or link your visits together.',

  'logs.title': 'Technical data',
  'logs.body':
    'The site is hosted on GitHub Pages. Like any web server, GitHub may log IP addresses and browser details to protect the service from abuse.',

  'cookies.title': '3. Cookies and browser storage',
  'cookies.body': 'We only store what is listed below on your device.',
  'cookies.colName': 'Name',
  'cookies.colPurpose': 'What it is for',
  'cookies.colTime': 'How long',
  'cookies.consentPurpose': 'Remembers whether you agreed to Google Analytics. Kept in browser storage.',
  'cookies.untilCleared': 'Until you clear your browser data',
  'cookies.langPurpose': 'Remembers the site language you chose. Kept in browser storage.',
  'cookies.gaPurpose':
    'Google Analytics cookies that tell one visitor apart from another. Only set after you agree.',
  'cookies.gaTime': 'Up to 2 years',
  'cookies.change':
    'You can change your choice at any time. If you withdraw consent, we remove the Google Analytics cookies from your browser.',
  'cookies.button': 'Change cookie settings',

  'recipients.title': '4. Who we share data with',
  'recipients.body': 'We use companies that process data on our behalf:',
  'recipients.list': `
          <li><strong>Formspree</strong>: receives waitlist signups.</li>
          <li><strong>Supabase</strong>: database for signups from the QR code pages.</li>
          <li><strong>Make.com</strong>: sends the discount code emails.</li>
          <li><strong>Google</strong>: Google Analytics, only after you agree.</li>
          <li><strong>GitHub</strong>: hosts the site.</li>
        `,
  'recipients.transfer':
    'Some of these companies may process data outside the European Economic Area, for example in the USA. In that case it is based on a European Commission decision (EU-US Data Privacy Framework) or standard contractual clauses. We do not sell your data or use it for advertising.',

  'rights.title': '5. Your rights',
  'rights.body':
    'You have the right to access, correct and delete your data, to restrict its processing, to data portability and to object. You can withdraw your consent at any time; this does not affect what happened before you withdrew it. Just write to <a href="mailto:hello@faveup.app">hello@faveup.app</a>. You can also complain to the Polish data protection authority, the President of the Personal Data Protection Office (<a href="https://uodo.gov.pl/en" rel="noopener">uodo.gov.pl</a>).',

  'changes.title': '6. Changes',
  'changes.body': 'If we change how we process data, we will update this page and the date at the top.',

  back: 'Back to the home page',
};
