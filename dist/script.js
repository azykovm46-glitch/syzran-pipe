const intro = document.querySelector('.intro');
const scene = document.querySelector('.scene');
const parties = document.querySelector('.parties');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');
let frame;

function paintScene() {
  frame = undefined;
  if (reducedMotion.matches) return;

  const viewport = document.documentElement.clientHeight;
  const introBottom = intro.getBoundingClientRect().bottom;
  const partiesTop = parties.getBoundingClientRect().top;
  const startDistance = viewport * (mobile.matches ? 0.38 : 0.73);
  const travelled = startDistance - partiesTop;
  const length = Math.max(1, introBottom - partiesTop - viewport * (mobile.matches ? 0.54 : 0.58) + startDistance);
  const progress = Math.max(0, Math.min(1, travelled / length));
  const edge = progress * 124;
  scene.style.setProperty('--edge', edge.toFixed(2) + '%');
  scene.style.setProperty('--cleared', (edge - 8).toFixed(2) + '%');
  scene.style.setProperty('--camera', (-progress * scene.clientWidth * (mobile.matches ? 0.09 : 0.14)).toFixed(2) + 'px');
  scene.style.setProperty('--scale', (1 + progress * 0.29).toFixed(3));
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

const quoteTitle = document.querySelector('#quote-title');
for (const link of document.querySelectorAll('a[href="#quote"]')) {
  link.addEventListener('click', () => requestAnimationFrame(() => quoteTitle.focus({ preventScroll: true })));
}

const form = document.querySelector('#quote-form');
const feedback = form.querySelector('.feedback');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const fields = [
    ['Имя', 'name'],
    ['Телефон или почта', 'contact'],
    ['Диаметр труб, мм', 'diameter'],
    ['Примерный метраж', 'length'],
    ['Ссылка на фото труб', 'photos'],
    ['Тип и состояние изоляции', 'coating'],
    ['Комментарий', 'notes'],
  ];
  const lines = fields.map(([label, key]) => label + ': ' + (data.get(key).trim() || '—'));
  const file = new Blob(['\ufeffЗаявка на расчёт партии\r\nМеханическое снятие изоляции со стальных труб в Сызрани\r\n\r\n', lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const download = document.createElement('a');
  download.href = url;
  download.download = 'заявка-на-расчёт.txt';
  document.body.append(download);
  download.click();
  download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  feedback.textContent = 'Заявка подготовлена к скачиванию.';
});
