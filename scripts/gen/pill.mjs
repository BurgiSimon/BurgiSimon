// Link pills under the hero, in the portfolio's pill style, with a slow sheen.
import fs from 'node:fs';
import { text } from '../lib/font.mjs';
import { doc, f } from '../lib/svg.mjs';

const icons = JSON.parse(fs.readFileSync(new URL('../data/icons.json', import.meta.url), 'utf8'));

export function pill({ label, icon }, t, delay = 0) {
  const H = 46, size = 17;
  const L = text(label, { x: 48, y: 29.5, size, weight: 500 });
  const W = Math.ceil(48 + L.width + 44);
  const dark = t.name === 'dark';
  const fill = dark ? t.raised : '#eef1ea';
  const sheen = dark ? '#ffffff' : '#ffffff';
  return doc({
    width: W, height: H,
    title: label, desc: `Link: ${label}`,
    defs: `<clipPath id="p"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${(H - 2) / 2}"/></clipPath>`
      + `<linearGradient id="sh" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="-40" y2="0"><stop stop-color="${sheen}" stop-opacity="0"/><stop offset=".5" stop-color="${sheen}" stop-opacity="${dark ? 0.09 : 0.6}"/><stop offset="1" stop-color="${sheen}" stop-opacity="0"/>`
      + `<animateTransform attributeName="gradientTransform" type="translate" values="0 0;${W + 160} 0;${W + 160} 0" keyTimes="0;.3;1" dur="8s" begin="${delay}s" repeatCount="indefinite"/></linearGradient>`,
    body: `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${fill}" stroke="${t.line}" stroke-width="1.5"/>`
      + `<rect class="motion" width="${W}" height="${H}" fill="url(#sh)" clip-path="url(#p)"/>`
      + `<path transform="translate(18 13) scale(.8333)" d="${icons[icon].path}" fill="${t.accent}"/>`
      + `<path d="${L.d}" fill="${t.text}"/>`
      + `<path d="M${f(W - 31)} 28.5l8-8M${f(W - 29)} 20.5h6v6" stroke="${t.muted}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  });
}
