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
