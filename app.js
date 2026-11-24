const examples = {
  daily: [
    ['Almuerzo', 'Alimentación', 18],
    ['Pasaje', 'Transporte', 5],
    ['Café', 'Gastos hormiga', 7],
  ],
  weekend: [
    ['Cine', 'Ocio', 35],
    ['Comida', 'Alimentación', 24.5],
  ],
};

const example = document.querySelector('#example');
const review = document.querySelector('#review');
const movements = document.querySelector('#movements');
const status = document.querySelector('#status');
const confirm = document.querySelector('#confirm');
const money = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});
let pending = null;
let total = 0;

example.addEventListener('change', () => {
  pending = null;
  review.hidden = true;
  status.textContent = '';
});

document.querySelector('#interpret').addEventListener('click', () => {
  pending = examples[example.value];
  movements.replaceChildren(...pending.map(([name, category, amount]) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const value = document.createElement('strong');
    label.textContent = name + ' · ' + category;
    value.textContent = money.format(amount);
    item.append(label, value);
    return item;
  }));
  review.hidden = false;
  status.textContent = 'Revisa ' + pending.length + ' gastos antes de confirmar.';
});

confirm.addEventListener('click', () => {
  if (!pending) return;
  total += pending.reduce((sum, movement) => sum + movement[2], 0);
  status.textContent = pending.length + ' gastos registrados en la demo. Total acumulado: ' + money.format(total) + '.';
  pending = null;
  review.hidden = true;
  document.querySelector('#interpret').focus();
});

const pointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const scene = document.querySelector('.scene');
const deviceGroup = document.querySelector('[data-tilt]');
scene.addEventListener('pointermove', (event) => {
  if (!pointer.matches) return;
  const rect = scene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  deviceGroup.style.setProperty('--rx', (6 - y * 17) + 'deg');
  deviceGroup.style.setProperty('--ry', (-9 + x * 21) + 'deg');
});
scene.addEventListener('pointerleave', () => {
  deviceGroup.style.removeProperty('--rx');
  deviceGroup.style.removeProperty('--ry');
});

const tourLinks = [...document.querySelectorAll('.tour-nav a')];
const tourViews = [...document.querySelectorAll('.tour-view')];
const tourPhone = document.querySelector('.tour-phone');

function showTourView(id, animate = false) {
  tourPhone.dataset.preview = id.slice("#vista-".length);
  for (const link of tourLinks) {
    if (link.hash === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  for (const view of tourViews) {
    view.hidden = '#' + view.id !== id;
    view.classList.toggle('is-entering', animate && !view.hidden);
  }
}

function syncTourView() {
  const target = tourLinks.find(link => link.hash === location.hash);
  showTourView(target?.hash ?? tourLinks[0].hash);
}

for (const link of tourLinks) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    showTourView(link.hash, true);
  });
}

window.addEventListener('hashchange', syncTourView);
syncTourView();

const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const sections = document.querySelectorAll('main > .section > .wrap');

if (motion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal.unobserve(entry.target);
      if (motion.matches && !entry.target.contains(document.activeElement)) {
        entry.target.animate(
          [{ transform: 'translateY(14px)', opacity: 0.78 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 440, easing: 'cubic-bezier(.2,.7,.25,1)' },
        );
      }
    }
  }, { threshold: 0.12 });
  sections.forEach(section => reveal.observe(section));
}
