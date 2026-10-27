// Snow report: the last year of contributions as a mountain range. Every week is a
// summit as high as that week's contributions; busy weeks carry snow, the busiest gets
// the summit cross (and the penguin). Contour lines and a slow scan are the "blueprint" accent.
import { text } from '../lib/font.mjs';
import { doc, f, k, rng } from '../lib/svg.mjs';
import { poly, flakes, flakeStyle, penguinStanding } from '../lib/scene.mjs';

const W = 1200, H = 410;
const X0 = 46, X1 = 1154, BASE = 410, TOP = 206; // ridge area; TOP keeps the summit label clear of the stats
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = iso => { const d = new Date(iso + 'T00:00:00Z'); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
const num = n => n.toLocaleString('en-US');

function frame(t, r, inner, style, defs, title, desc) {
  const dark = t.name === 'dark';
  let stars = '';
  if (dark) for (let i = 0; i < 70; i++) stars += `<circle cx="${f(r() * W)}" cy="${f(r() ** 1.3 * 230)}" r="${f(0.4 + r())}" opacity="${f(0.2 + r() * 0.6)}"${r() < 0.3 ? ` class="tw" style="animation-duration:${f(2.5 + r() * 4)}s;animation-delay:-${f(r() * 6)}s"` : ''}/>`;
  return doc({
    width: W, height: H, title, desc,
    style: flakeStyle(H) + '.tw{animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.08}}' + style,
    defs: `<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>`
      + `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${t.sky.map((c, i) => `<stop offset="${k(i / (t.sky.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>` + defs,
    body: `<g clip-path="url(#frame)"><rect width="${W}" height="${H}" fill="url(#sky)"/><g fill="${t.text}">${stars}</g>${inner}`
      + `${flakes(r, { n: 30, w: W, rmin: 0.6, rmax: 1.7, op: dark ? 0.6 : 0.95, dmin: 12, dmax: 20, color: dark ? t.text : '#ffffff' })}</g>`
      + `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${t.line}" opacity=".9"/>`,
  });
}

function statBlock(x, label, value, unit, sub, t) {
  const L = text(label.toUpperCase(), { x, y: 52, size: 15, weight: 500, tracking: 0.13 });
  const V = text(value, { x, y: 106, size: 48, weight: 400, tracking: -0.02 });
  const U = unit ? text(unit, { x: x + V.width + 8, y: 106, size: 21, weight: 400 }) : null;
  const S = sub ? text(sub, { x, y: 136, size: 16.5, weight: 400 }) : null;
  return `<path d="${L.d}" fill="${t.muted}"/><path d="${V.d}" fill="${t.text}"/>`
    + (U ? `<path d="${U.d}" fill="${t.muted}"/>` : '') + (S ? `<path d="${S.d}" fill="${t.muted}"/>` : '');
}

export function snowReport(cal, s, t, updated) {
  const r = rng(2026);
  const dark = t.name === 'dark';
  const n = s.sums.length, step = (X1 - X0) / (n - 1);
  const max = Math.max(1, ...s.sums);
  const FLOOR = 24; // quiet weeks still leave room for the month labels
  const height = v => (v ? FLOOR + 8 + (BASE - TOP - FLOOR - 8) * Math.sqrt(v / max) : FLOOR);
  const peaks = s.sums.map((v, i) => [X0 + i * step, BASE - height(v) - (v ? r() * 3 : 0)]);

  // front ridge: summits joined through shallow saddles, so busy stretches read as massifs
  const ridge = [[X0 - 40, BASE - FLOOR]];
  peaks.forEach((p, i) => {
    // the year's summit gets a small plateau, room for the cross and the penguin
    if (i === s.peak) ridge.push([p[0] - 9, p[1] + 1], [p[0] + 9, p[1] + 1]);
    else ridge.push(p);
    const q = peaks[i + 1];
    if (q) {
      const low = Math.max(p[1], q[1]);
      ridge.push([(p[0] + q[0]) / 2 + (r() - 0.5) * step * 0.3, low + (BASE - low) * 0.14]);
    }
  });
  ridge.push([X1 + 40, BASE - FLOOR]);
  const body = [...ridge, [X1 + 40, H + 4], [X0 - 40, H + 4]];

  // back range: the same year, smoothed over a month either side, for depth
  const back = s.sums.map((_, i) => {
    const near = s.sums.slice(Math.max(0, i - 4), i + 5);
    return [X0 + i * step, BASE - height(near.reduce((a, b) => a + b, 0) / near.length) * 1.12 - 16];
  });
  const backBody = [[X0 - 40, back[0][1]], ...back, [X1 + 40, back.at(-1)[1]], [X1 + 40, H + 4], [X0 - 40, H + 4]];

  const snowY = BASE - FLOOR - (BASE - TOP - FLOOR) * 0.45;
  const snowline = [];
  for (let x = X0 - 40; x <= X1 + 50; x += 7) snowline.push([x, snowY + r() ** 3 * 30 + r() * 5]);
  const cap = poly([[X0 - 40, 0], ...snowline, [X1 + 50, 0]]);

  // contour lines every 18 units, clipped to the range
  let contours = '';
  for (let y = BASE - 10; y > TOP - 20; y -= 18) contours += `M${X0 - 40} ${y}H${X1 + 40}`;

  // month labels where a month starts
  let months = '', last = -1;
  cal.weeks.forEach((w, i) => {
    const m = new Date(w[0].date + 'T00:00:00Z').getUTCMonth();
    if (m !== last && i > 0 && i < n - 2) months += `<path d="${text(MONTHS[m], { x: X0 + i * step, y: BASE - 8, size: 13, weight: 500, anchor: 'middle' }).d}"/>`;
    last = m;
  });

  // the summit of the year: cross, label and the penguin
  const [sx, sy] = peaks[s.peak];
  const weekOf = cal.weeks[s.peak][0].date;
  const peakLabel = text(`Peak week · ${num(s.sums[s.peak])}`, { x: 0, y: 0, size: 14, weight: 500 });
  const labelX = Math.min(Math.max(sx - peakLabel.width / 2, 20), W - peakLabel.width - 20);
  const summit = !s.sums[s.peak] ? '' : `<path transform="translate(${f(labelX)} ${f(sy - 36)})" d="${peakLabel.d}" fill="${t.text}"/>`
    + `<g transform="translate(${f(sx - 7)} ${f(sy + 2)}) scale(.8)">${penguinStanding(t)}</g>`
    + `<path d="M${f(sx + 7)} ${f(sy + 1)}v-25M${f(sx + 1)} ${f(sy - 16)}h12" stroke="${t.text}" stroke-width="2.6" stroke-linecap="round"/>`;

  // today: a beacon on the last summit
  const [tx, ty] = peaks[n - 1];
  const beacon = `<circle cx="${f(tx)}" cy="${f(ty)}" r="4.5" fill="${t.accent}"/><circle cx="${f(tx)}" cy="${f(ty)}" r="5" stroke="${t.accent}" stroke-width="2" fill="none" class="ping"/>`
    + `<path d="${text('today', { x: tx - 10, y: ty - 14, size: 13, weight: 500, anchor: 'end' }).d}" fill="${t.accent}"/>`;

  const rock = dark ? ['#243329', '#121b16'] : ['#8a9c85', '#68795f'];
  const backCap = poly([[X0 - 40, 0], ...snowline.map(([x, y]) => [x, y - 30]), [X1 + 50, 0]]);
  const defs = `<clipPath id="range"><path d="${poly(body)}"/></clipPath><clipPath id="back"><path d="${poly(backBody)}"/></clipPath>`
    + `<linearGradient id="rock" x1="0" y1="${TOP}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${rock[0]}"/><stop offset="1" stop-color="${rock[1]}"/></linearGradient>`
    + `<linearGradient id="cap" x1="0" y1="${TOP}" x2="0" y2="${f(snowY + 30)}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.snow}"/><stop offset="1" stop-color="${t.snowShade}"/></linearGradient>`
    + `<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${t.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${t.accent}" stop-opacity="${dark ? 0.32 : 0.4}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient>`;
  const style = `.grow{transform-origin:0 ${H}px;animation:grow 1.8s cubic-bezier(.2,.8,.2,1) both}@keyframes grow{from{transform:scaleY(.04)}}`
    + `.scan{animation:scan 9s ease-in-out infinite}@keyframes scan{from{transform:translateY(${H}px)}to{transform:translateY(${TOP - 120}px)}}`
    + '.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.2s ease-out infinite}@keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(4.2);opacity:0}}'
    + '.flap{transform-box:fill-box;animation:flap 1.4s ease-in-out infinite alternate}@keyframes flap{0%,60%{transform:rotate(0)}100%{transform:rotate(-38deg)}}';

  const range = `<g class="grow">`
    + `<path d="${poly(backBody)}" fill="${t.far}"/><path d="${backCap}" fill="${t.farSnow}" opacity=".7" clip-path="url(#back)"/>`
    + `<path d="${poly(body)}" fill="url(#rock)"/>`
    + `<g clip-path="url(#range)"><path d="${cap}" fill="url(#cap)"/>`
    + `<path d="${contours}" stroke="${t.accent}" stroke-width="1" opacity="${dark ? 0.11 : 0.16}"/>`
    + `<rect class="scan" x="0" y="0" width="${W}" height="120" fill="url(#scan)"/>`
    + `<g fill="${dark ? t.muted : '#f0f4e8'}" opacity=".85">${months}</g></g>`
    + `<path d="M${ridge.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}" stroke="${t.snow}" stroke-width="1.3" stroke-linejoin="round" opacity="${dark ? 0.45 : 0.7}"/></g>`;

  const updatedText = text(`Updated ${fmtDate(updated)} · weekly totals, last 12 months`, { x: W - 32, y: 30, size: 13, weight: 400, anchor: 'end' });
  const stats = statBlock(48, 'Contributions', num(s.total), '', 'in the last year', t)
    + statBlock(338, 'Current streak', String(s.current), s.current === 1 ? 'day' : 'days', s.current ? 'and counting' : 'next run starts today', t)
    + statBlock(628, 'Longest streak', String(s.longest), s.longest === 1 ? 'day' : 'days', `${num(s.activeDays)} active days`, t)
    + statBlock(918, 'Best day', num(s.best.count), '', s.best.date ? fmtDate(s.best.date) : '—', t);

  return frame(t, r, `${range}${summit}${beacon}${stats}<path d="${updatedText.d}" fill="${t.muted}" opacity=".8"/>`, style, defs,
    `Snow report: ${num(s.total)} contributions in the last year`,
    `${num(s.total)} contributions in the last year, current streak ${s.current} days, longest streak ${s.longest} days, best day ${s.best.count}${s.best.date ? ` on ${fmtDate(s.best.date)}` : ''}. Drawn as a mountain range of weekly totals; the peak week (${num(s.sums[s.peak])}, week of ${fmtDate(weekOf)}) carries a summit cross. Updated ${fmtDate(updated)}.`);
}

// Shown until the workflow has run once.
export function snowPlaceholder(t) {
  const r = rng(5);
  const a = text('The snow report is on its way.', { x: W / 2, y: 178, size: 30, weight: 400, anchor: 'middle' });
  const b = text('The profile workflow draws it from my contribution graph, once a day.', { x: W / 2, y: 216, size: 18, weight: 400, anchor: 'middle' });
  const ground = poly([[-10, 300], [300, 286], [600, 296], [900, 282], [1210, 292], [1210, H + 4], [-10, H + 4]]);
  return frame(t, r, `<path d="${ground}" fill="${t.snowShade}"/><path d="${a.d}" fill="${t.text}"/><path d="${b.d}" fill="${t.muted}"/>`
    + `<g transform="translate(600 300)">${penguinStanding(t)}</g>`, '', '',
  'Snow report: waiting for the first workflow run', 'Placeholder until the profile workflow draws the contribution report.');
}
