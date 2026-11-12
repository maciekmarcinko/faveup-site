// Thank-you page after a business signs up (/dziekujemy/, /en/dziekujemy/): reports the lead to the
// ad platforms once, then offers an optional second form for the place's details.
import { attribution, currentLead, reportLead, setupAds } from './ads.js';

const FORMSPREE_URL = 'https://formspree.io/f/xwlezeap';

setupAds();
reportLead();

const lead = currentLead();
const section = document.querySelector('[data-lead-details]');
// Without a sign-up from this visit (a direct visit or a shared link) there is no email to attach
// the details to.
if (lead) {
  section.hidden = false;
  const form = section.querySelector('[data-details-form]');
  const error = form.querySelector('.signup__error');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    form.classList.add('is-sending');
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: lead.email,
          source: `${lead.source}-details`,
          language: document.documentElement.lang,
          business_name: form.elements.business_name.value,
          business_area: form.elements.business_area.value,
          phone: form.elements.phone.value,
          ...attribution(),
          _gotcha: form.elements._gotcha.value,
          _subject: 'Szczegóły leada: FaveUp',
        }),
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      form.hidden = true;
      form.nextElementSibling.hidden = false;
    } catch (failure) {
      console.error(failure);
      error.hidden = false;
    } finally {
      form.classList.remove('is-sending');
    }
  });
}
