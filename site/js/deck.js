import { setupLangLinks } from './lang-links.js';
import { setupPlayer } from './phone-player.js';


setupLangLinks();

const film = setupPlayer(document.getElementById('deck-film'));
const deck = document.querySelector('[data-deck]');
const stage = document.querySelector('[data-stage]');
const slides = [...document.querySelectorAll('[data-slide]')];
const counter = document.querySelector('[data-current]');
const prevButton = document.querySelector('[data-prev]');
const nextButton = document.querySelector('[data-next]');

// Keep in sync with the media query in deck.css.
const pagedQuery = matchMedia('(min-width: 900px) and (min-height: 560px)');
let current = 0;

function updateChrome() {
  counter.textContent = String(current + 1);
  prevButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  history.replaceState(null, '', `#${current + 1}`);
}

function goTo(index, { scroll } = { scroll: true }) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  if (slides[current].id === 'slide-2' && target !== current) film.pause();
  current = target;
  if (pagedQuery.matches) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.inert = i !== current;
    });
  } else if (scroll) {
    scrollToSlide(current, 'smooth');
  }
  updateChrome();
}

// Stacked layout: land the slide just below the sticky header.
function scrollToSlide(index, behavior) {
  const header = document.querySelector('.deck-bar').getBoundingClientRect().height;
  const top = slides[index].getBoundingClientRect().top + window.scrollY - header - 12;
  window.scrollTo({ top, behavior });
}

function fit() {
  const box = deck.getBoundingClientRect();
  const styles = getComputedStyle(deck);
  const width = box.width - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const height = box.height - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
  if (pagedQuery.matches) stage.style.setProperty('--scale', String(Math.min(width / 1280, height / 720)));
  else stage.style.setProperty('--mscale', String(width / 1280));
}

function applyMode() {
  fit();
  if (pagedQuery.matches) {
    goTo(current, { scroll: false });
  } else {
    for (const slide of slides) {
      slide.classList.remove('is-active');
      slide.inert = false;
    }
    // Instant, so the observer's first report already sees the deep-linked slide.
    if (current > 0) scrollToSlide(current, 'instant');
  }
}

prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));

window.addEventListener('keydown', (event) => {
  if (event.target.closest('input, textarea') || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1);
  else if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1);
  else if (event.key === 'Home') goTo(0);
  else if (event.key === 'End') goTo(slides.length - 1);
  else return;
  event.preventDefault();
});

// Horizontal swipe pages the deck on touch screens in paged mode.
let touchStart = null;
stage.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse') touchStart = { x: event.clientX, y: event.clientY };
});
stage.addEventListener('pointerup', (event) => {
  if (!touchStart || !pagedQuery.matches) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
});

// In the scrolling layout the counter follows the slide just under the header
// (slides are short on phones, so the middle of the screen can already show the next one).
const visibility = new IntersectionObserver(
  (entries) => {
    if (pagedQuery.matches) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const index = slides.indexOf(entry.target);
      if (index !== current && slides[current].id === 'slide-2') film.pause();
      current = index;
      updateChrome();
    }
  },
  { rootMargin: '-15% 0px -75% 0px' },
);
for (const slide of slides) visibility.observe(slide);

window.addEventListener('resize', fit);
pagedQuery.addEventListener('change', applyMode);

const fromHash = Number.parseInt(location.hash.slice(1), 10);
current = Number.isInteger(fromHash) ? Math.max(0, Math.min(slides.length - 1, fromHash - 1)) : 0;
applyMode();
