// English for the thank-you page. Polish lives in site/dziekujemy/index.html; scripts/build-en.mjs
// applies these values and writes site/en/dziekujemy/index.html. Relative hrefs are relative to it.

export default {
  'meta.title': 'Thank you | FaveUp',
  'nav.homeHref': '../',

  title: 'Thank you, we got your sign-up!',
  nextTitle: "What's next?",
  next1: "We'll email you to set up 15 minutes at your place.",
  next2: "We'll show you how the QR code test and the bonus for your customers work.",
  next3: 'Once the app launches, you get 20% off.',

  moreTitle: 'Speed things up (optional)',
  moreSub: "Tell us which place it is, and we'll come prepared.",
  nameLabel: 'Name of your place',
  areaLabel: 'Address or neighborhood',
  phoneLabel: 'Phone (optional)',
  send: 'Send',
  sending: 'Sending…',
  error: "We couldn't send it. Please try again or write to hello@faveup.app.",
  doneTitle: 'Thanks, got it!',
  doneDesc: 'Talk to you soon.',

  home: 'Back to the home page',
};
