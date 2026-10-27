// Beyond: Simon hikes past a Swiss-style trail signpost whose destinations are his
// interests, with the walking times a signpost would give. The penguin tags along.
import { text } from '../lib/font.mjs';
import { doc, f, k, rng } from '../lib/svg.mjs';
import { chain, smooth, mountain, pine, flakeStyle, sprite, penguinStanding } from '../lib/scene.mjs';

const W = 1200, H = 320;

// ∞ is not in the font, so it is drawn.
const infinity = (x, y, s) => `<path d="M${f(x)} ${f(y)}c${f(-3 * s)} ${f(-4 * s)} ${f(-9 * s)} ${f(-4 * s)} ${f(-9 * s)} 0s${f(6 * s)} ${f(4 * s)} ${f(9 * s)} 0 ${f(6 * s)} ${f(-4 * s)} ${f(9 * s)} 0 ${f(-6 * s)} ${f(4 * s)} ${f(-9 * s)} 0z" fill="none" stroke-width="${f(1.9 * s)}"/>`;

export function beyond(items, t) {
  const r = rng(404);
  const dark = t.name === 'dark';
  const defs = [], body = [], style = [flakeStyle(H)];

  defs.push(`<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${t.sky.map((c, i) => `<stop offset="${k(i / (t.sky.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`,
    `<radialGradient id="sun" cx="930" cy="150" r="360" gradientUnits="userSpaceOnUse"><stop stop-color="${dark ? t.accent : '#fbf6d6'}" stop-opacity="${dark ? 0.2 : 0.9}"/><stop offset="1" stop-color="${dark ? t.accent : '#fbf6d6'}" stop-opacity="0"/></radialGradient>`);
  body.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#sun)"/>`);
  if (dark) {
    let stars = '';
    for (let i = 0; i < 40; i++) stars += `<circle cx="${f(r() * W)}" cy="${f(r() ** 1.6 * 150)}" r="${f(0.4 + r())}" opacity="${f(0.2 + r() * 0.6)}"/>`;
    body.push(`<g fill="${t.text}">${stars}</g>`, `<path d="M936 78a19 19 0 1 0 12 33 16 16 0 1 1-12-33z" fill="${t.text}" opacity=".9"/>`);
  } else {
    body.push('<circle cx="930" cy="110" r="26" fill="#fffbe6"/>');
  }

  // drifting clouds
  let clouds = '';
  for (const [x, y, s] of [[160, 70, 1], [620, 46, 0.8], [1040, 82, 0.7]]) {
    clouds += `<g class="drift" style="animation-delay:-${f(r() * 60)}s"><path transform="translate(${x} ${y}) scale(${s})" d="M-60 0h120a22 22 0 0 0-30-26 30 30 0 0 0-52-6A24 24 0 0 0-60 0z" fill="${dark ? t.hover : '#ffffff'}" opacity="${dark ? 0.55 : 0.85}"/></g>`;
  }
  body.push(clouds);
  style.push('.drift{animation:drift 70s linear infinite alternate}@keyframes drift{to{transform:translateX(90px)}}');

  // horizon range and meadows
  const farMats = { r, rock: t.far, shade: t.farShade, snow: t.farSnow, snowShade: t.farSnowShade };
  for (const p of [
    { ridge: [[-40, 230], [60, 170], [130, 120], [190, 150], [260, 200], [320, 230]], spine: [140, 240], snowY: 150 },
    { ridge: [[200, 230], [300, 160], [380, 104], [450, 136], [520, 178], [600, 230]], spine: [400, 240], snowY: 140 },
    { ridge: [[520, 230], [610, 176], [690, 138], [760, 168], [840, 230]], spine: [700, 240], snowY: 162 },
    { ridge: [[1000, 230], [1080, 160], [1150, 128], [1230, 170]], spine: [1160, 240], snowY: 158 },
  ]) {
    const m = mountain({ ...farMats, ridge: chain(p.ridge, r, 0.22, 3), spine: p.spine, base: 240, snowY: p.snowY, fingers: 10, snowOpacity: 0.9 });
    defs.push(m.defs); body.push(m.body);
  }
  const meadowA = dark ? '#1c2a21' : '#c5d2bc', meadowB = dark ? '#16221b' : '#b2c2a8', meadowC = dark ? '#121c16' : '#a3b598';
  body.push(`<path d="${smooth([[-20, 236], [200, 222], [420, 236], [640, 220], [860, 232], [1060, 216], [1220, 228]])}L1220 ${H}L-20 ${H}Z" fill="${meadowA}"/>`,
    `<path d="${smooth([[-20, 262], [260, 248], [520, 258], [800, 246], [1220, 256]])}L1220 ${H}L-20 ${H}Z" fill="${meadowB}"/>`);

  // pines on the meadow
  let pines = '';
  for (const [x, y, h] of [[90, 246, 44], [118, 250, 32], [560, 244, 38], [1010, 238, 50], [1040, 242, 36], [1180, 244, 42]]) pines += pine(x, y, h, t, r);
  body.push(pines);

  // the trail
  const trail = [[-90, 286], [150, 280], [400, 290], [650, 282], [900, 288], [1150, 280], [1300, 284]];
  body.push(`<path d="${smooth([[-20, 278], [300, 268], [700, 274], [1220, 266]])}L1220 ${H}L-20 ${H}Z" fill="${meadowC}"/>`,
    `<path d="${smooth(trail)}" stroke="${dark ? '#34463a' : '#d9cfb4'}" stroke-width="16" stroke-linecap="round"/>`);
  let flowers = '';
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = 300 + r() * 18;
    flowers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.4 + r() * 1.6)}" fill="${r() < 0.6 ? t.accent : (dark ? '#eaf0e6' : '#ffffff')}" opacity="${f(0.55 + r() * 0.4)}"/>`;
  }
  body.push(flowers);

  // the signpost: stacked arrows, destination left, time right
  const SX = 770, signW = 290, signH = 36;
  const signFill = dark ? t.accent : '#526e29', signInk = dark ? t.accentInk : '#f0f4e8';
  // the pole stands at the tail end of the arrows, as on real Swiss signposts
  let signs = `<rect x="${SX - signW / 2 - 8}" y="100" width="11" height="${f(288 - 100)}" rx="3" fill="${dark ? '#55615a' : '#6b7a68'}"/>`;
  items.forEach((it, i) => {
    const y = 104 + i * (signH + 6);
    const name = text(it.name, { x: SX - signW / 2 + 16, y: y + 24.5, size: 18, weight: 500 });
    const time = it.time === '∞' ? infinity(SX + signW / 2 - 40, y + 18, 1.4) : `<path d="${text(it.time, { x: SX + signW / 2 - 30, y: y + 24.5, size: 16.5, weight: 400, anchor: 'end' }).d}" fill="${signInk}"/>`;
    signs += `<path d="M${SX - signW / 2} ${y}h${signW - 18}l18 ${signH / 2}-18 ${signH / 2}H${SX - signW / 2}z" fill="${signFill}"/>`
      + `<path d="${name.d}" fill="${signInk}"/><g stroke="${signInk}">${time}</g>`;
  });
  body.push(`<g>${signs}</g>`);

  // Simon hikes across, alternating steps; the penguin waddles after him
  const S = 0.62, D = 22;
  defs.push(sprite('stepA', 'hike-step-a', S), sprite('stepB', 'hike-step-b', S));
  const path = smooth(trail.map(([x, y]) => [x, y - 2]));
  const walk = begin => `<animateMotion dur="${D}s" begin="${begin}s" repeatCount="indefinite" path="${path}" calcMode="linear"/>`;
  style.push('.sA{animation:sA .64s steps(1) infinite}.sB{animation:sA .64s steps(1) infinite reverse}@keyframes sA{50%{opacity:0}}',
    '.waddle{animation:waddle .5s ease-in-out infinite alternate}@keyframes waddle{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}');
  // negative begins: both are already on the trail when the image loads, the penguin 2.2s behind
  body.push(`<g class="motion"><g><ellipse rx="20" ry="3.5" fill="#000" opacity=".18"/><use href="#stepA" class="sA"/><use href="#stepB" class="sB"/>${walk(-7)}</g></g>`,
    `<g class="motion"><g transform="translate(0 4)">${penguinStanding(t, 'waddle')}</g>${walk(-4.8)}</g>`,
    `<g class="still" transform="translate(470 287)"><use href="#stepA"/></g>`);

  const list = items.map(it => `${it.name} (${it.time === '∞' ? 'always' : it.time})`).join(', ');
  return doc({
    width: W, height: H,
    title: `Beyond the screen: ${items.map(i => i.name).join(', ')}`,
    desc: `Simon hikes past a Swiss trail signpost pointing to his interests: ${list}. A penguin waddles after him.`,
    style: style.join(''), defs: defs.join(''),
    body: `<g clip-path="url(#frame)">${body.join('')}</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${t.line}" opacity=".9"/>`,
  });
}
