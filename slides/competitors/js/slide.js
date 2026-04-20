const fallbackData = {
  brands: [
    { name: 'oldPharm', value: 32 },
    { name: 'MediCore', value: 21 },
    { name: 'PharmaNova', value: 17 },
    { name: 'Healix', value: 13 },
    { name: 'BioRelief', value: 10 },
    { name: 'ZenLabs', value: 7 },
  ],
  colors: [
    '#2b6cb0',
    '#68d391',
    '#f6ad55',
    '#fc8181',
    '#b794f4',
    '#63b3ed',
    '#fbbf24',
    '#34d399',
    '#f87171',
    '#a78bfa',
    '#60a5fa',
    '#f472b6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#3b82f6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#e11d48',
    '#d946ef',
    '#06b6d4',
    '#84cc16',
    '#facc15',
    '#22c55e',
    '#eab308',
    '#fb923c',
    '#c084fc',
    '#2dd4bf',
    '#9ca3af',
    '#f43f5e',
    '#0ea5e9',
    '#a3e635',
    '#d8b4fe',
    '#38bdf8',
    '#e879f9',
    '#4ade80',
    '#fb7185',
    '#cbd5e1',
    '#fcd34d',
    '#6ee7b7',
    '#bae6fd',
    '#fca5a5',
    '#d9f99d',
    '#fde047',
    '#bef264',
    '#c7d2fe',
    '#a5f3fc',
    '#fecdd3',
  ],
};

// Круговая диаграмма
fetch('../../../data/competitors.json')
  .then((res) => res.json())
  .catch(() => fallbackData)
  .then((data) => {
    const svg = document.getElementById('chart');
    const legend = document.getElementById('legend');

    const cx = 200;
    const cy = 200;
    const radius = 150;

    let startAngle = 0;

    const colors = data.colors;

    const slices = [];
    const legendItems = [];

    data.brands.forEach((item, index) => {
      const angle = (item.value / 100) * 360;
      const endAngle = startAngle + angle;

      const path = describeArc(cx, cy, radius, startAngle, endAngle);

      const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      slice.setAttribute('d', path);
      slice.setAttribute('fill', colors[index]);
      slice.setAttribute('data-index', index);

      svg.appendChild(slice);
      slices.push(slice);

      const legendItem = document.createElement('div');
      legendItem.classList.add('legend-item');
      legendItem.setAttribute('data-index', index);

      legendItem.innerHTML = `
            <div class="legend-color" style="background:${colors[index]}"></div>
            <span>${item.name} - ${item.value}%</span>
          `;

      legend.appendChild(legendItem);
      legendItems.push(legendItem);

      slice.addEventListener('mouseenter', () => highlight(index));
      slice.addEventListener('mouseleave', resetHighlight);

      legendItem.addEventListener('mouseenter', () => highlight(index));
      legendItem.addEventListener('mouseleave', resetHighlight);

      startAngle = endAngle;
    });

    function highlight(index) {
      slices.forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });

      legendItems.forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });
    }

    function resetHighlight() {
      slices.forEach((el) => el.classList.remove('active'));
      legendItems.forEach((el) => el.classList.remove('active'));
    }
  })
  .catch((error) => {
    console.error('Ошибка загрузки данных:', error);
  });

// Перевод угла и радиуса в координаты
function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Сектор круга для SVG
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}
