(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 720px)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('.header');
  const photo = document.querySelector('.hero-visual');
  const track = document.querySelector('.journey-track');
  const steps = [...track.children];
  let frame = 0, stageTimer = 0, active = -1, target = -1;

  // Default HTML is fully readable if scripts or observation APIs are unavailable.
  document.querySelectorAll('.button, .program-link').forEach(link => {
    const arrow = document.createElement('span');
    arrow.className = 'link-arrow'; arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
  });
  document.querySelectorAll('.program').forEach(panel => {
    const stages = panel.querySelector('.stages');
    const shell = document.createElement('div'); shell.className = 'stages-shell';
    stages.before(shell); shell.append(stages);
    const flow = document.createElement('span'); flow.className = 'hover-flow'; flow.setAttribute('aria-hidden', 'true');
    flow.textContent = panel.id === 'spark' ? 'EXPLORE → IDENTIFY → VALIDATE → DECIDE' : 'VALIDATE → BUILD → LAUNCH → GROW';
    shell.append(flow);
  });
  steps.slice(4).forEach(step => step.classList.add('achieved'));

  const revealItems = [...document.querySelectorAll('.section-heading, .program, .journey-heading, .journey-end')];
  let observer;
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('motion-ready');
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('in-view'); observer.unobserve(entry.target);
      }
    }, {threshold:0.08, rootMargin:'0px 0px -25px 0px'});
    revealItems.forEach((item, index) => {
      // Never hide already-visible content, including direct program hash links.
      const rect = item.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) item.classList.add('in-view');
      item.classList.add('reveal');
      if (item.id === 'ignite') item.style.setProperty('--reveal-delay', '100ms');
      observer.observe(item);
    });
  }
  function activateNext() {
    if (active >= target) { stageTimer = 0; return; }
    active += 1;
    steps[active].classList.add('is-active');
    if (active > 0) steps[active - 1].classList.add('is-passed');
    stageTimer = window.setTimeout(activateNext, reduced.matches ? 0 : 185);
  }
  function update() {
    frame = 0;
    header.classList.toggle('scrolled', scrollY > 16);
    if (!reduced.matches && fine.matches && !mobile.matches) {
      const r = photo.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) photo.style.setProperty('--photo-shift', `${Math.max(-10, Math.min(10, -r.top * .025))}px`);
    }
    let next = -1;
    steps.forEach((step, index) => {
      // On desktop, stagger activation thresholds along the horizontal sequence.
      const top = step.getBoundingClientRect().top + (mobile.matches ? 0 : index * 26);
      if (reduced.matches || top < innerHeight * .88) next = index;
    });
    // At the page end, the final milestone must always be reachable.
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 5) next = steps.length - 1;
    target = Math.max(target, next);
    if (!stageTimer && active < target) activateNext();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      observer?.disconnect(); revealItems.forEach(item => item.classList.add('in-view'));
      document.documentElement.classList.remove('motion-ready');
      photo.style.removeProperty('--photo-shift');
      clearTimeout(stageTimer); stageTimer = 0; target = steps.length - 1;
      steps.forEach((step, index) => { step.classList.add('is-active'); if(index < steps.length-1) step.classList.add('is-passed'); });
      active = steps.length - 1;
    }
    schedule();
  });
  document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('.nav a').forEach(other => other.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
  }));
  schedule();
})();
