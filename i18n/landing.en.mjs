// English for the landing. Polish lives in site/index.html; scripts/build-en.mjs applies these
// values to its data-i18n / data-i18n-attr markers and writes site/en/index.html.
// Values for data-i18n are HTML (they replace the element's content); values for
// data-i18n-attr are plain attribute text. Relative hrefs here are relative to /en/.

export default {
  'meta.title': 'Push Notifications &amp; QR Codes for Local Businesses | FaveUp',
  'meta.description':
    'Customers scan a QR code at your place and you send them push notifications about deals and new products. Win repeat customers without SMS blasts or chasing reach.',
  'meta.canonical': 'https://www.faveup.app/en/',
  'meta.ogTitle': 'FaveUp – push notifications for local businesses',
  'meta.ogDescription':
    'Sell more with simple notifications. Customers scan a QR code and you tell them about deals and new products.',
  'meta.ogImageAlt': 'FaveUp logo',
  'meta.ogLocale': 'en_US',
  'meta.ogLocaleAlt': 'pl_PL',
  'meta.jsonld': `
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.faveup.app/#organization",
            "name": "FaveUp",
            "url": "https://www.faveup.app/",
            "logo": "https://www.faveup.app/assets/apple-touch-icon.png",
            "email": "hello@faveup.app",
            "description": "Push notifications for local businesses: customers scan a QR code and get deals and news from their favorite places."
          },
          {
            "@type": "WebSite",
            "@id": "https://www.faveup.app/en/#website",
            "name": "FaveUp",
            "url": "https://www.faveup.app/en/",
            "inLanguage": "en",
            "publisher": { "@id": "https://www.faveup.app/#organization" }
          }
        ]
      }
    `,

  'brand.tagline': 'Built with ❤️ for local businesses and their communities',
  'nav.homeHref': './',
  'nav.join': 'Join the waitlist',
  'nav.joinShort': 'Join',
  'nav.viewLabel': 'View',
  'nav.langLabel': 'Language',
  'nav.business': 'For Business',
  'nav.users': 'For Users',
  'nav.plCurrent': 'false',
  'nav.enCurrent': 'page',
  'nav.enHref': './',

  'hero.eyebrow': 'Push notifications for local businesses',
  'hero.title': 'Sell more with simple notifications',
  'hero.subtitle': 'Your regulars always hear in time – none of them will miss an important moment at your place again',
  'hero.cta': 'Join the waitlist',
  'hero.scroll': 'Scroll down to see how it works',

  'phone.date': 'Tuesday, December 17',
  'phone.now': 'now',
  'phone.notifTitle': '☕ Fresh beans just arrived!',
  'phone.notifBody': 'Try our Ethiopian blend. The first 20 people get 20% off!',
  'phone.imageAlt': 'Freshly roasted coffee beans at Aroma Café',
  'phone.unlock': 'Slide to unlock',

  'player.play': 'See how FaveUp works',
  'player.pause': 'Pause the film',
  'player.resume': 'Resume the film',
  'player.meta': 'Short film · 0:36 · with sound',
  'player.playAria': 'Play the film: how FaveUp works',
  'player.closeAria': 'Close the film',
  'player.muteAria': 'Mute / unmute',

  'what.title': 'What is FaveUp?',
  'what.desc':
    'FaveUp is a simple push notification channel for local businesses that bypasses social media noise, SMS blasts and ineffective newsletters: customers scan a QR code at your place and get news about promotions, novelties and new products, while you build customer loyalty and grow sales among your regulars.',
  'what.exampleLabel': 'Real-life example',
  'what.exampleName': 'Flora Flowers',
  'what.examplePush': 'Today until 6 pm only: tulip bouquets 20% off. Just 25 left, first come, first served! 🌷',
  'what.exampleResult': 'Customers came the same day and used the promotion.',

  'how.title': 'How does it work in practice?',
  'how.subtitle': '4 simple steps to reach your customers',
  'how.s1Title': 'Scan the QR code',
  'how.s1Desc':
    'Customers scan your QR code at the counter, bar or table, or find you on the map in the FaveUp app, and add your place to their favorites.',
  'how.s2Title': 'You send a push',
  'how.s2Desc':
    'In a simple web panel you write about news, a promotion or free appointment slots, AI helps you keep it short, and you send it with one click.',
  'how.s3Title': 'Push on their phone',
  'how.s3Desc': "The message lands on your customers' phones right away – no algorithm, no noise.",
  'how.s4Title': 'Statistics',
  'how.s4Desc': 'See how many customers follow you and how they react to each push, while sales grow.',

  'why.title': 'Why FaveUp?',
  'why.subtitle': 'The simplest way to stay in touch with your regular customers',
  'why.b1':
    'You reach people who already know and like your place more effectively and grow sales among regulars – they get notified about new products, promotions and events',
  'why.b2': 'You can add time-limited offers and boost customer engagement with limited-time promotions',
  'why.b3': 'You get a simple, instant communication channel without fighting for reach and ads',
  'why.b4':
    'You have a permanent channel to your customers without building and maintaining your own mobile app, the way big chains do',

  'for.title': 'Who is it for?',
  'for.subtitle': 'We help local businesses in many industries — here are a few',
  'for.i1': 'Cafes, Restaurants &amp; Bakeries',
  'for.i2': 'Retail Stores',
  'for.i3': 'Local Artisans',
  'for.i4': 'Gyms &amp; Fitness Studios',
  'for.i5': 'Hair &amp; Beauty Salons',
  'for.ctaTitle': 'Maybe your business needs this too?',
  'for.ctaLink': 'Join the beta',

  'faq.title': 'Frequently asked questions',
  'faq.subtitle': 'What to know about push notifications for your place',
  'faq.q1': 'How is FaveUp different from SMS marketing, newsletters and social media?',
  'faq.a1':
    'Social media posts get buried by the algorithm, newsletters get lost among other emails, and every SMS in a campaign is paid for separately. A FaveUp push notification lands straight on the phone screen of people who chose to follow your place – no algorithm, no ads, no fighting for reach.',
  'faq.q2': 'Is FaveUp a loyalty program?',
  'faq.a2':
    "FaveUp builds customer loyalty, but it isn't another stamp card. Instead of a reward after the tenth coffee, you give regulars what they actually look for: a heads-up about a fresh delivery, a new product, a free appointment slot or a deal for the next hour. So they come back more often and are keener to try new things.",
  'faq.q3': 'How do customers start following my place?',
  'faq.a3':
    'You put a QR code at the counter, bar or table – as a sticker or a stand. Customers scan it with their phone and add your place to their favorites. They can also find you on the map in the FaveUp app.',
  'faq.q4': 'Do I need my own mobile app?',
  'faq.a4':
    "No. Customers keep all their favorite places in one FaveUp app, and you send notifications from a simple panel in your browser. You don't build or maintain an app of your own.",
  'faq.q5': 'What kinds of businesses is FaveUp for?',
  'faq.a5':
    'Local businesses with regular customers: cafes, restaurants, bakeries and pastry shops, retail stores, hair and beauty salons, gyms, fitness studios, local artisans and cultural venues. We are already running a QR code pilot with a cafe, a pastry shop and a local cultural center in Brochów, Poland.',
  'faq.q6': 'How much does FaveUp cost and when does it launch?',
  'faq.a6': 'The app is in development. Businesses that join the beta now get 20% off at launch.',

  'contact.badge': 'Get in touch',
  'contact.title': 'Sign up for the beta and get 20% off at launch.',
  'contact.subtitle': 'Grow your sales with FaveUp',
  'contact.question': 'Have a question?',
  'form.label': 'Email address',
  'form.placeholder': 'Your email address',
  'form.submit': 'Join the beta and get 20% off at launch',
  'form.sending': 'Sending…',
  'form.error': "We couldn't send it. Please try again or write to hello@faveup.app.",
  'form.thanks': 'Thank you!',
  'form.thanksDesc': "We'll get back to you at that address.",

  'footer.presentation': 'Detailed Presentation',
  'footer.presentationHref': 'prezentacja/',
  'footer.privacy': 'Privacy policy',
  'footer.privacyHref': 'privacy/',
  'footer.dev': 'The app is currently in development.',
  'footer.copy': '© 2026 FaveUp. Connecting local businesses with their communities.',

  'users.title': 'Instant updates from the spots you love',
  'users.subtitle': 'Follow your favorite cafes, restaurants and local spots and hear about deals and news right away',
  'users.cta': 'Join the waitlist',
  'users.demoTitle': 'See it in action 📱',
  'users.demoSub': 'Example notification from a local coffee shop',
  'users.soon': 'Coming soon',
  'users.stayTitle': 'Stay connected with your favorite local spots',
  'users.stayDesc':
    'Imagine getting instant notifications about special events, exclusive deals, and important updates from the places you actually care about.',
  'users.f1Title': 'From places you love',
  'users.f1Desc': 'Only hear from local spots you choose to follow',
  'users.f2Title': 'Essential updates only',
  'users.f2Desc': 'No spam, just the good stuff that matters',
  'users.f3Title': 'Never miss a deal',
  'users.f3Desc': "Get exclusive offers before they're gone",
  'users.f4Title': 'Zero FOMO, zero noise',
  'users.f4Desc': 'Unfollow anytime with a single tap',
  'users.copy': '© 2026 FaveUp. Building better connections between local businesses and their communities.',
};
