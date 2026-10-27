// Toolkit: a chairlift that carries every tool up the mountain, one chair each.
import fs from 'node:fs';
import { text } from '../lib/font.mjs';
import { doc, f, rng } from '../lib/svg.mjs';
import { chain, poly, pine, flakes, flakeStyle } from '../lib/scene.mjs';

const W = 1200, H = 340;
const icons = JSON.parse(fs.readFileSync(new URL('../data/icons.json', import.meta.url), 'utf8'));
const builtin = {
  // a microchip, for electronics
  chip: { path: 'M9 1.5h2V5H9zm4 0h2V5h-2zM9 19h2v3.5H9zm4 0h2v3.5h-2zM1.5 9H5v2H1.5zm0 4H5v2H1.5zM19 9h3.5v2H19zm0 4h3.5v2H19zM6 6h12v12H6zm3 3v6h6V9z', hex: '#d5ee9b', evenodd: true },
  // a steaming cup, for Java
  cup: { path: 'M8.2 1.6c1.6 1.4-1.4 2.6.2 4.2l-1 .9c-2.4-2.1.9-3.4-.2-4.4zm4 0c1.6 1.4-1.4 2.6.2 4.2l-1 .9c-2.4-2.1.9-3.4-.2-4.4zM3 8.5h14.5v1.2h1.3a3.5 3.5 0 0 1 0 7h-2.1A7.3 7.3 0 0 1 10.3 21h-.1A7.3 7.3 0 0 1 3 13.7zm14.5 2.7v4h1.3a2 2 0 0 0 0-4zM1.5 22h18v1.5h-18z', hex: '#f89820' },
};

// relative luminance contrast, to keep dark logos visible on dark badges (and pale ones on light)
const lum = hex => {
  const [r, g, b] = hex.match(/\w\w/g).map(c => parseInt(c, 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const CABLE = x => 206 - 0.136 * x;          // cable height at x
const GROUND = x => 336 - 0.104 * x;         // slope surface at x
const ANGLE = Math.atan(0.136);
const STRIDE = 158;                           // distance between chairs along the cable
const SPEED = 38;                             // units per second

export function chairlift(tools, t) {
  const r = rng(77);
  const dark = t.name === 'dark';
  const badge = dark ? t.raised : '#fbfcf9';
  const N = tools.length, L = N * STRIDE, T = f(L / SPEED);
  const style = [flakeStyle(H), `.ride{animation:ride ${T}s linear infinite}@keyframes ride{to{transform:translate(${f(L * Math.cos(ANGLE))}px,${f(-L * Math.sin(ANGLE))}px)}}`,
    '.swing{animation:swing 3.6s ease-in-out infinite alternate}@keyframes swing{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}'];
  const defs = [`<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${t.sky.map((c, i) => `<stop offset="${f(i / (t.sky.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`,
    `<linearGradient id="snow" x1="0" y1="150" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.snow}"/><stop offset="1" stop-color="${t.snowShade}"/></linearGradient>`];
  const body = [`<rect width="${W}" height="${H}" fill="url(#sky)"/>`];

  // stars (night) / nothing (day), distant ridge, slope
  if (dark) {
    let stars = '';
    for (let i = 0; i < 45; i++) stars += `<circle cx="${f(r() * W)}" cy="${f(r() ** 1.4 * 170)}" r="${f(0.4 + r())}" opacity="${f(0.2 + r() * 0.6)}"/>`;
    body.push(`<g fill="${t.text}">${stars}</g>`);
  }
  const ridge = chain([[-20, 196], [140, 150], [260, 182], [420, 118], [560, 160], [700, 96], [840, 140], [980, 84], [1100, 124], [1220, 100]], r, 0.25, 3);
  body.push(`<path d="${poly([...ridge, [1220, H], [-20, H]])}" fill="${t.far}"/>`);
  const snowcaps = ridge.filter(([, y]) => y < 130).length ? ridge.map(([x, y]) => [x, y + Math.max(0, 140 - y) * 0.55]) : [];
  if (snowcaps.length) body.push(`<path d="${poly([...ridge, ...snowcaps.slice().reverse()])}" fill="${t.farSnow}" opacity=".55"/>`);
  body.push(`<path d="M-20 ${f(GROUND(-20))}L1220 ${f(GROUND(1220))}L1220 ${H}L-20 ${H}Z" fill="url(#snow)"/>`);
  body.push(flakes(r, { n: 26, w: W, rmin: 0.6, rmax: 1.6, op: dark ? 0.6 : 0.9, dmin: 11, dmax: 19, color: dark ? t.text : '#ffffff' }));

  // pylons
  let pylons = '';
  for (const x of [250, 720, 1130]) {
    const top = CABLE(x) - 8, foot = GROUND(x) + 4;
    pylons += `<path d="M${x - 5} ${f(foot)}L${x - 3} ${f(top)}h6l2 ${f(foot - top)}Z" fill="${t.pine}"/>`
      + `<path d="M${x - 24} ${f(top + 2)}h48" stroke="${t.pine}" stroke-width="5" stroke-linecap="round"/>`
      + `<circle cx="${x - 13}" cy="${f(top - 1)}" r="4" fill="${t.line}"/><circle cx="${x + 13}" cy="${f(top - 1)}" r="4" fill="${t.line}"/>`;
  }
  body.push(pylons);

  // cables (return line slightly behind)
  body.push(`<path d="M-40 ${f(CABLE(-40) - 15)}L1240 ${f(CABLE(1240) - 15)}" stroke="${t.pine}" stroke-width="1.4" opacity=".55"/>`,
    `<path d="M-40 ${f(CABLE(-40))}L1240 ${f(CABLE(1240))}" stroke="${t.pine}" stroke-width="2.2"/>`);

  // the chairs: each drawn once in <defs>, placed twice; the train slides one line-up length per loop
  const chairInk = dark ? '#0a110d' : t.pine;
  tools.forEach((tool, j) => {
    const ic = builtin[tool.icon] ?? icons[tool.icon];
    let color = tool.color ?? ic.hex;
    if (contrast(color, badge) < 2.1) color = t.text;
    const label = text(tool.name, { x: 0, y: 99.5, size: 17.5, weight: 500, anchor: 'middle' });
    const lw = label.width + 24;
    defs.push(`<g id="ch${j}">`
      + `<rect x="-7" y="-4" width="14" height="7" rx="2" fill="${chairInk}" transform="rotate(${f(-ANGLE * 180 / Math.PI)})"/>`
      // hanger, backrest and seat behind the rider; safety bar in front of it
      + `<path d="M0 2V20Q0 24-4 24H-27Q-31 24-31 28L-33 69H30L32 63" stroke="${chairInk}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<circle cx="-2" cy="45" r="21" fill="${badge}" stroke="${t.line}" stroke-width="1.5"/>`
      + `<path transform="translate(-14.6 32.4) scale(1.05)" d="${ic.path}" fill="${color}"${ic.evenodd ? ' fill-rule="evenodd"' : ''}/>`
      + `<path d="M0 20Q25 22 29 33V53" stroke="${chairInk}" stroke-width="3" stroke-linecap="round" fill="none"/>`
      + `<rect x="${f(-lw / 2)}" y="77" width="${f(lw)}" height="30" rx="15" fill="${dark ? t.surface : '#fbfcf9'}" stroke="${t.line}"/>`
      + `<path d="${label.d}" fill="${t.text}"/></g>`);
  });
  let chairs = '';
  for (let i = 0; i < 2 * N; i++) {
    const s = -L + i * STRIDE;
    const x = -40 + s * Math.cos(ANGLE), y = CABLE(-40) - s * Math.sin(ANGLE);
    chairs += `<g transform="translate(${f(x)} ${f(y)})"><use href="#ch${i % N}" class="swing" style="animation-delay:-${f(r() * 3.6)}s;animation-duration:${f(3.2 + r() * 1.4)}s"/></g>`;
  }
  body.push(`<g class="ride">${chairs}</g>`);

  // foreground pines
  let pines = '';
  for (const [x, h] of [[30, 54], [64, 38], [470, 30], [498, 44], [930, 36], [1172, 50], [1196, 34]]) pines += pine(x, GROUND(x) + 40 + (r() * 10), h, t, r);
  body.push(pines);

  return doc({
    width: W, height: H,
    title: `Toolkit: ${tools.map(x => x.name).join(', ')}`,
    desc: `A chairlift carries one tool per chair up a snowy slope: ${tools.map(x => x.name).join(', ')}.`,
    style: style.join(''), defs: defs.join(''),
    body: `<g clip-path="url(#frame)">${body.join('')}</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${t.line}" opacity=".9"/>`,
  });
}
