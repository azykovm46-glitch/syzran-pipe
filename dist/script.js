const intro = document.querySelector('.intro');
const scene = document.querySelector('.scene');
const parties = document.querySelector('.parties');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let frame;

function paintScene() {
  frame = undefined;
  if (reducedMotion.matches) return;

  const viewport = document.documentElement.clientHeight;
  const bounds = intro.getBoundingClientRect();
  const startDistance = viewport * 0.92;
  const travelled = startDistance - parties.getBoundingClientRect().top;
  const length = Math.max(1, travelled + bounds.bottom - viewport);
  const progress = Math.max(0, Math.min(1, travelled / length));
  const edge = progress * 105;
  scene.style.setProperty('--edge', edge.toFixed(2) + '%');
  scene.style.setProperty('--cleared', (edge - 5).toFixed(2) + '%');
  scene.style.setProperty('--rim-opacity', (Math.sin(progress * Math.PI) * 0.85).toFixed(3));
  scene.style.setProperty('--rim-angle', (progress * 240 - 60).toFixed(1) + 'deg');
  scene.style.setProperty('--scale', (1 + progress * 0.04).toFixed(3));
  scene.style.setProperty('--progress', (progress * 100).toFixed(2) + '%');
}

function schedulePaint() {
  if (frame === undefined) frame = requestAnimationFrame(paintScene);
}

addEventListener('scroll', schedulePaint, { passive: true });
addEventListener('resize', schedulePaint);
addEventListener('pageshow', schedulePaint);
reducedMotion.addEventListener('change', schedulePaint);
new ResizeObserver(schedulePaint).observe(intro);
paintScene();

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches) {
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
  mobileLayout.addEventListener('change', updateMobileContact);
}

for (const link of document.querySelectorAll('a[href="#contacts"]')) {
  const title = document.querySelector(link.hash + '-title');
  link.addEventListener('click', () => requestAnimationFrame(() => title.focus({ preventScroll: true })));
}
