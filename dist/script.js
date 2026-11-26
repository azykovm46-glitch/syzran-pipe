const intro = document.querySelector('.intro');
const scene = document.querySelector('.scene');
const parties = document.querySelector('.parties');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mask = 'linear-gradient(black, transparent)';
const canAnimate = window.CSS && (CSS.supports('mask-image', mask) || CSS.supports('-webkit-mask-image', mask));
let frame;
let previousProgress;
let sceneIsNear = true;
scene.classList.toggle('is-animated', Boolean(canAnimate));

function onMediaChange(query, listener) {
  if (query.addEventListener) query.addEventListener('change', listener);
  else if (query.addListener) query.addListener(listener);
}

function paintScene() {
  frame = undefined;
  if (reducedMotion.matches) return;

  const viewport = scene.clientHeight;
  const bounds = intro.getBoundingClientRect();
  const startDistance = viewport * 0.92;
  const travelled = startDistance - parties.getBoundingClientRect().top;
  const length = Math.max(1, travelled + bounds.bottom - viewport);
  const progress = Math.max(0, Math.min(1, travelled / length));
  if (progress === previousProgress) return;
  previousProgress = progress;
  const edge = progress * 105;
  scene.style.setProperty('--edge', edge.toFixed(2) + '%');
  scene.style.setProperty('--cleared', (edge - 5).toFixed(2) + '%');
  scene.style.setProperty('--rim-opacity', (Math.sin(progress * Math.PI) * 0.85).toFixed(3));
  scene.style.setProperty('--rim-angle', (progress * 240 - 60).toFixed(1) + 'deg');
  scene.style.setProperty('--scale', (1 + progress * 0.04).toFixed(3));
  scene.style.setProperty('--progress', progress.toFixed(4));
}

function schedulePaint() {
  if (sceneIsNear && !reducedMotion.matches && frame === undefined) frame = requestAnimationFrame(paintScene);
}

if (canAnimate) {
  addEventListener('scroll', schedulePaint, { passive: true });
  addEventListener('resize', schedulePaint);
  addEventListener('pageshow', schedulePaint);
  onMediaChange(reducedMotion, schedulePaint);
  if ('ResizeObserver' in window) new ResizeObserver(schedulePaint).observe(intro);
  if ('IntersectionObserver' in window) {
    const activity = new IntersectionObserver(([entry]) => {
      sceneIsNear = entry.isIntersecting;
      schedulePaint();
    }, { rootMargin: '200px 0px' });
    activity.observe(intro);
  }
  paintScene();
}

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches && typeof entry.target.animate === 'function') {
        entry.target.animate(
          [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
          { duration: 480, easing: 'ease-out' }
        );
      }
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });

  for (const panel of document.querySelectorAll('.parties > div, .process > div')) {
    reveal.observe(panel);
  }
}

const mobileContact = document.querySelector('.mobile-contact');
const mobileLayout = matchMedia('(max-width: 760px)');
if ('IntersectionObserver' in window) {
  const heroActions = document.querySelector('.hero-actions');
  const contactSection = document.querySelector('#contacts');
  const visible = new Set();

  function updateMobileContact() {
    mobileContact.hidden = !mobileLayout.matches || visible.size > 0;
    document.body.classList.toggle('has-mobile-contact', !mobileContact.hidden);
    document.body.classList.toggle('at-contacts', visible.has(contactSection));
  }

  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    updateMobileContact();
  });
  visibility.observe(heroActions);
  visibility.observe(contactSection);
  onMediaChange(mobileLayout, updateMobileContact);
}

for (const link of document.querySelectorAll('a[href="#contacts"]')) {
  const title = document.querySelector(link.hash + '-title');
  link.addEventListener('click', () => requestAnimationFrame(() => title.focus({ preventScroll: true })));
}
