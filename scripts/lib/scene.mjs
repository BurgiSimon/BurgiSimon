// Shared alpine scenery: ridges, faceted mountains, pines, the penguin, snowfall, sprites.
import { f, read } from './svg.mjs';

// Midpoint displacement between a and b: a rough ridge line (endpoints kept).
export function jag(a, b, r, rough, depth = 4) {
  let pts = [a, b];
  for (let i = 0; i < depth; i++, rough *= 0.58) {
    const next = [pts[0]];
    for (let j = 1; j < pts.length; j++) {
      const [x1, y1] = pts[j - 1], [x2, y2] = pts[j];
      const len = Math.hypot(x2 - x1, y2 - y1);
      next.push([(x1 + x2) / 2 + (r() - 0.5) * rough * len * 0.25, (y1 + y2) / 2 + (r() - 0.5) * rough * len], pts[j]);
    }
    pts = next;
  }
  return pts;
}

export const chain = (pts, r, rough, depth) =>
  pts.slice(1).reduce((acc, p, i) => acc.concat(jag(pts[i], p, r, rough, depth).slice(1)), [pts[0]]);

export const poly = pts => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';

// Smooth path through points (Catmull-Rom → cubic Bézier).
export function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// A faceted mountain: lit west face, shaded east face, streaky snow cap.
let uid = 0;
export function mountain({ ridge, spine, base, snowY, fingers = 26, r, rock, shade, snow, snowShade, snowOpacity = 1 }) {
  const id = `m${uid++}`;
  const peak = ridge.reduce((best, p, i) => (p[1] < ridge[best][1] ? i : best), 0);
  const left = ridge.slice(0, peak + 1), right = ridge.slice(peak);
  const spinePts = jag(ridge[peak], spine, r, 0.18, 4);
  const lit = [...left, ...spinePts.slice(1), [left[0][0], base]];
  const shaded = [...right, [right.at(-1)[0], base], ...spinePts.slice().reverse()];
  const x0 = ridge[0][0], x1 = ridge.at(-1)[0];
  const line = [];
  for (let x = x0; x <= x1 + 12; x += 9) line.push([x, snowY + (r() ** 3) * fingers * 3 + r() * fingers * 0.35]);
  const cap = poly([[x0 - 20, -20], [x0 - 20, snowY], ...line, [x1 + 20, snowY], [x1 + 20, -20]]);
  return {
    defs: `<clipPath id="${id}l"><path d="${poly(lit)}"/></clipPath><clipPath id="${id}s"><path d="${poly(shaded)}"/></clipPath>`,
    body: `<path d="${poly([...ridge, [x1, base], [x0, base]])}" fill="${rock}"/><path d="${poly(shaded)}" fill="${shade}"/>`
      + `<g opacity="${snowOpacity}"><path d="${cap}" fill="${snow}" clip-path="url(#${id}l)"/><path d="${cap}" fill="${snowShade}" clip-path="url(#${id}s)"/></g>`,
  };
}

export function pine(x, y, h, t, r) {
  const w = h * 0.42;
  let d = '', snow = '';
  for (let i = 0; i < 4; i++) {
    const ty = y - h * (0.22 + i * 0.2), tw = w * (1 - i * 0.2), top = ty - h * 0.36;
    d += `M${f(x - tw / 2)} ${f(ty)}L${f(x)} ${f(top)}L${f(x + tw / 2)} ${f(ty)}Z`;
    snow += `M${f(x - tw * 0.3)} ${f(ty - h * 0.08)}L${f(x)} ${f(top + h * 0.05)}L${f(x + tw * 0.06)} ${f(ty - h * 0.12)}Z`;
  }
  d += `M${f(x - w * 0.06)} ${f(y)}h${f(w * 0.12)}v${f(-h * 0.25)}h${f(-w * 0.12)}Z`;
  return `<path d="${d}" fill="${t.pine}"/><path d="${snow}" fill="${t.pineSnow}" opacity="${f(0.55 + r() * 0.3)}"/>`;
}

// The GitHub-bio penguin, in ski goggles, sliding on its belly (head first, to the left).
export function penguin(t, s = 1) {
  return `<g transform="translate(0 ${f(-6 * s)}) scale(${s})">`
    + `<ellipse cx="2" cy="7" rx="18" ry="2.6" fill="${t.snowDeep}" opacity=".5"/>`
    + '<path d="M-15 0C-15-7-7-10 3-9C12-8 19-5 21 0C19 4 12 6 3 6C-7 6-15 4-15 0Z" fill="#0b120e"/>'
    + '<path d="M-11 2.2C-4 5.6 8 5.8 17 2.2C12 4.6 4 5.4-3 5C-7 4.6-10 3.6-11 2.2Z" fill="#f4f7f2"/>'
    + '<circle cx="-14" cy="-3.5" r="6.2" fill="#0b120e"/><path d="M-19.6-3.2L-26-1.6-19.4-.2Z" fill="#f2a43a"/>'
    + `<rect x="-19.4" y="-7.4" width="8.6" height="4.2" rx="2.1" fill="${t.accent === '#526e29' ? '#b9d97a' : t.accent}"/>`
    + '<rect x="-18" y="-6.6" width="2.4" height="1.2" rx=".6" fill="#ffffff" opacity=".8"/>'
    + '<path d="M-11-5.6L-4.5-4.4" stroke="#3a4a3d" stroke-width="1.4"/>'
    + '<path d="M5-6.5C10-11 15-11.5 18-10" stroke="#0b120e" stroke-width="3.2" stroke-linecap="round"/>'
    + '<path d="M20 .5l5.5-2.2M20 2.6l5.8.4" stroke="#f2a43a" stroke-width="1.8" stroke-linecap="round"/></g>';
}

// The same penguin standing (feet at 0,0), goggles pushed up. `cls` animates the whole
// bird (e.g. "waddle"); its right flipper carries the class "flap" for scenes that wave it.
export function penguinStanding(t, cls = '') {
  return `<g class="${cls}"><ellipse rx="13" ry="3" fill="#000" opacity=".18"/>`
    + '<path d="M-11-2C-14-14-12-30 0-34 12-30 14-14 11-2Z" fill="#0b120e"/>'
    + '<path d="M-7-3C-9-12-8-24 0-26 8-24 9-12 7-3Z" fill="#f4f7f2"/>'
    + '<circle cx="-3.5" cy="-27" r="1.6" fill="#f4f7f2"/><circle cx="3.5" cy="-27" r="1.6" fill="#f4f7f2"/>'
    + '<path d="M-3-24L0-20 3-24Z" fill="#f2a43a"/>'
    + `<rect x="-9" y="-36" width="18" height="5" rx="2.5" fill="${t.name === 'dark' ? t.accent : '#b9d97a'}"/>`
    + '<path class="flap" d="M10-23c5 4 7 10 6 15-3-2-6-6-7-11z" fill="#0b120e"/><path d="M-10-23c-5 4-7 10-6 15 3-2 6-6 7-11z" fill="#0b120e"/>'
    + '<path d="M-7-1l-4 2h7zM7-1l4 2h-7z" fill="#f2a43a"/></g>';
}

// Falling snow. Needs the .fl / .sy keyframes in the image's style.
export function flakes(r, { n, w, rmin, rmax, op, dmin, dmax, sway = false, color }) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const c = `<circle cx="${f(r() * w)}" r="${f(rmin + r() * (rmax - rmin))}" opacity="${f(op * (0.6 + r() * 0.4))}" class="fl" style="animation-duration:${f(dmin + r() * (dmax - dmin))}s;animation-delay:-${f(r() * dmax)}s"/>`;
    out += sway ? `<g class="sy" style="animation-duration:${f(2.5 + r() * 3)}s;animation-delay:-${f(r() * 5)}s">${c}</g>` : c;
  }
  return `<g fill="${color}">${out}</g>`;
}

export const flakeStyle = h => `.fl{animation:fl 12s linear infinite}@keyframes fl{from{transform:translateY(-12px)}to{transform:translateY(${h + 12}px)}}`
  + '.sy{animation:sy 4s ease-in-out infinite alternate}@keyframes sy{from{transform:translateX(-7px)}to{transform:translateX(7px)}}';

// A 192px character frame (feet at y=182), anchored at its feet.
export const sprite = (id, name, s) =>
  `<image id="${id}" href="data:image/webp;base64,${read(`scripts/sprites/${name}.webp`).toString('base64')}" width="192" height="192" transform="translate(${f(-96 * s)} ${f(-182 * s)}) scale(${s})"/>`;
