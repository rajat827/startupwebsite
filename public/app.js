const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
});
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); nav.classList.remove('open'); }
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-path]').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.program-step').forEach(step => step.classList.remove('selected'));
  document.querySelector(`.${link.dataset.path}-step`).classList.add('selected');
}));
const about = document.querySelector('#about-dialog');
document.querySelector('[data-about]').addEventListener('click', () => { closeMenu(); about.showModal(); });
document.querySelector('.dialog-close').addEventListener('click', () => about.close());
document.querySelector('[data-close-about]').addEventListener('click', () => about.close());
about.addEventListener('click', event => { if (event.target === about) { const r = about.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) about.close(); } });

// Native scrolling provides touch support and a readable no-JavaScript fallback.
const carousel = document.querySelector('.carousel-track');
if (carousel) {
 const captions = [
  ['FROM A FIRST THOUGHT TO A FIRST BUILD', 'Make it tangible.'],
  ['WHERE BUILDERS MEET', 'Build with other builders.'],
  ['FROM AN IDEA TO REAL CONVERSATIONS', 'Get closer to customers.'],
  ['DEFENCE TECH / BUILT FOR THE FIELD', 'Build for real conditions.']
 ];
 let selected = 0;
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 function updateCarousel() {
  const next = Math.max(0, Math.min(captions.length - 1, Math.round(carousel.scrollLeft / carousel.clientWidth)));
  if (next === selected) return;
  selected = next;
  document.querySelector('.carousel-caption .editorial-kicker').textContent = captions[selected][0];
  document.querySelector('.carousel-caption .editorial-title').textContent = captions[selected][1];
  document.querySelector('.carousel-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(captions.length).padStart(2, '0')}`;
 }
 function moveCarousel(direction) {
  const next = (selected + direction + captions.length) % captions.length;
  carousel.scrollTo({left: next * carousel.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
 }
 carousel.addEventListener('scroll', updateCarousel, {passive:true});
 document.querySelector('.carousel-prev').addEventListener('click', () => moveCarousel(-1));
 document.querySelector('.carousel-next').addEventListener('click', () => moveCarousel(1));
 carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();moveCarousel(event.key === 'ArrowRight' ? 1 : -1);}
 });
 new ResizeObserver(() => carousel.scrollTo({left:selected * carousel.clientWidth,behavior:'instant'})).observe(carousel);
}
