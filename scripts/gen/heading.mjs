// Section heading: a small chapter label over a large title whose last word is
// set in the accent colour (as on the portfolio), with a slow shimmer passing through it.
import { text } from '../lib/font.mjs';
import { doc, f } from '../lib/svg.mjs';

const W = 1200, H = 128;

export function heading({ label, title }, index, t) {
  const [lead, middle, accent] = title;
  const plain = [lead, middle].filter(Boolean).join(' ');
  const L = text(`${String(index).padStart(2, '0')} · ${label.toUpperCase()}`, { x: 4, y: 30, size: 17, weight: 500, tracking: 0.16 });
  const T = text(plain, { x: 0, y: 98, size: 50, weight: 400, tracking: -0.025 });
  const A = text(accent, { x: T.width + (plain ? 13 : 0), y: 98, size: 50, weight: 400, tracking: -0.025 });
  const end = A.x0 + A.width;

  // a hairline from the title to the edge, with one small summit on it
  const peakX = Math.max(end + 70, W - 150);
  const rule = end + 30 < W - 40
    ? `<path d="M${f(end + 30)} 86H${f(peakX - 24)}L${f(peakX - 8)} 72L${f(peakX)} 78L${f(peakX + 12)} 62L${f(peakX + 34)} 86H${W - 4}" stroke="${t.line}" stroke-width="1.5" stroke-linejoin="round"/>`
      + `<circle cx="${f(peakX + 12)}" cy="62" r="3" fill="${t.accent}"/>`
    : '';

  const shimmer = t.name === 'dark' ? '#f6ffe0' : '#8fb24a';
  const defs = `<linearGradient id="sh" gradientUnits="userSpaceOnUse" x1="${f(A.x0 - 160)}" y1="0" x2="${f(A.x0)}" y2="0">`
    + `<stop offset="0" stop-color="${t.accent}"/><stop offset=".5" stop-color="${shimmer}"/><stop offset="1" stop-color="${t.accent}"/>`
    + `<animateTransform attributeName="gradientTransform" type="translate" values="0 0;${f(A.width + 320)} 0;${f(A.width + 320)} 0" keyTimes="0;.35;1" dur="7s" repeatCount="indefinite"/></linearGradient>`;

  return doc({
    width: W, height: H,
    title: `${label}: ${[plain, accent].filter(Boolean).join(' ')}`,
    desc: `Section heading. ${label}: ${[plain, accent].filter(Boolean).join(' ')}`,
    defs,
    body: `<path d="${L.d}" fill="${t.muted}"/><path d="${T.d}" fill="${t.text}"/>`
      + `<path d="${A.d}" fill="${t.accent}"/><path class="motion" d="${A.d}" fill="url(#sh)"/>${rule}`,
  });
}
