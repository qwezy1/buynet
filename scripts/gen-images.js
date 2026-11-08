/**
 * Генерирует лёгкие локальные SVG-обложки для объявлений (~1–2 КБ каждая)
 * в app/public/img/. Источник данных — server/src/seed/listings.json.
 * Запуск: node scripts/gen-images.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const listings = require(path.join(root, 'server', 'src', 'seed', 'listings.json'));
const outDir = path.join(root, 'app', 'public', 'img');
fs.mkdirSync(outDir, { recursive: true });

// Базовый оттенок по категории
const HUES = {
  electronics: 210,
  transport: 12,
  'real-estate': 160,
  clothing: 330,
  home: 36,
  services: 262,
  hobby: 190,
  pets: 100,
};

// Минималистичные иконки (24×24, stroke), по категории
const ICONS = {
  electronics:
    '<rect x="7" y="2" width="10" height="20" rx="2.5"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/>',
  transport:
    '<path d="M4 16v-4.5L6.3 7.2A2 2 0 0 1 8.2 6h7.6a2 2 0 0 1 1.9 1.2L20 11.5V16"/><path d="M4 16h16"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
  'real-estate':
    '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
  clothing:
    '<path d="M8.5 4 4 7l1.6 3L8 9v11h8V9l2.4 1L20 7l-4.5-3-1.7 2h-3.6L8.5 4Z"/>',
  home: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 17v-4a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4"/><path d="M5 17v2M19 17v2M3 17h18"/>',
  services:
    '<path d="M14.7 6.3a4.5 4.5 0 0 0-6 5.6L3 17.6V21h3.4l5.7-5.7a4.5 4.5 0 0 0 5.6-6l-2.8 2.8-2.5-.7-.7-2.5 3-2.6Z"/>',
  hobby:
    '<path d="M9 18V5.5L21 3v12.5"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="18.5" cy="15.5" r="2.5"/>',
  pets:
    '<circle cx="6" cy="9.5" r="1.7"/><circle cx="10.2" cy="6" r="1.7"/><circle cx="14.8" cy="6" r="1.7"/><circle cx="19" cy="9.5" r="1.7"/><path d="M12.6 11.5c-2.6 0-5.1 2.6-5.1 4.8 0 1.5 1.1 2.5 2.6 2.5 1 0 1.7-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.6-1 2.6-2.5 0-2.2-2.5-4.8-5.1-4.8Z"/>',
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function svgFor(item) {
  const h = (HUES[item.category] ?? 168) + (hash(item.img) % 21) - 10;
  const r = hash(item.img + 'x');
  const c1x = 120 + (r % 160);
  const c1y = 90 + ((r >> 4) % 120);
  const c2x = 420 + ((r >> 3) % 160);
  const c2y = 300 + ((r >> 5) % 120);
  const gid = 'g' + item.img;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h},45%,88%)"/>
      <stop offset="1" stop-color="hsl(${h},42%,74%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#${gid})"/>
  <circle cx="${c1x}" cy="${c1y}" r="150" fill="hsl(${h},50%,70%)" opacity="0.45"/>
  <circle cx="${c2x}" cy="${c2y}" r="110" fill="hsl(${h},55%,64%)" opacity="0.3"/>
  <circle cx="${(c1x + c2x) / 2}" cy="${(c1y + c2y) / 2}" r="60" fill="none" stroke="hsl(${h},45%,96%)" stroke-width="2" opacity="0.7"/>
  <g transform="translate(320,240) scale(6.5) translate(-12,-12)" fill="none" stroke="hsl(${h},45%,97%)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    ${ICONS[item.category] ?? ICONS.home}
  </g>
</svg>
`;
}

let n = 0;
for (const item of listings) {
  fs.writeFileSync(path.join(outDir, `${item.img}.svg`), svgFor(item));
  n++;
}
console.log(`Сгенерировано ${n} SVG в app/public/img/`);
