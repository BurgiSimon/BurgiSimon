// Hero: an alpine night. Simon carves down the slope under a citron aurora,
// a goggled penguin slides after him, and a typed line cycles through what he builds.
import { text, glyphSet } from '../lib/font.mjs';
import { doc, f, k, rng, read } from '../lib/svg.mjs';
import { chain, poly, smooth, mountain, pine, penguin, flakes, flakeStyle, sprite } from '../lib/scene.mjs';

const W = 1200, H = 420;

function auroraShape(x0, x1, yb, amp, h, phase) {
  const top = [], bottom = [];
  for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 26) {
    const u = (x - x0) / (x1 - x0);
    const taper = Math.sin(Math.PI * u) ** 0.7;
    const y = yb + amp * Math.sin(x * 0.0075 + phase) + amp * 0.45 * Math.sin(x * 0.019 + phase * 1.9);
    bottom.push([x, y]);
    top.push([x, y - h * taper * (0.65 + 0.35 * Math.sin(x * 0.012 + phase * 0.7))]);
  }
  return poly([...top, ...bottom.reverse()]);
}

export function hero(content, t) {
  const r = rng(1291);
  const defs = [], body = [], style = [];

  // sky, glow, stars
  defs.push(`<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${t.sky.map((c, i) => `<stop offset="${k(i / (t.sky.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`,
    `<radialGradient id="glow" cx="790" cy="170" r="430" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 .45 0 93.5)"><stop stop-color="${t.aurora[0]}" stop-opacity=".16"/><stop offset="1" stop-color="${t.aurora[0]}" stop-opacity="0"/></radialGradient>`);
  body.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`);
  let stars = '';
  for (let i = 0; i < 95; i++) {
    const x = r() * W, y = r() ** 1.5 * 280, rad = 0.45 + r() * 1.05, op = 0.25 + r() * 0.65;
    const tw = r() < 0.35 ? ` class="tw" style="animation-duration:${f(2.4 + r() * 4)}s;animation-delay:-${f(r() * 6)}s"` : '';
    stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" opacity="${f(op)}"${tw}/>`;
  }
  body.push(`<g fill="${t.text}">${stars}</g>`);
  style.push('.tw{animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.08}}');

  // aurora: each ribbon morphs once in <defs>; a blurred copy glows, an unfiltered copy keeps the
  // crisp lower edge. Animated SVG images repaint every frame, so blur passes are kept to three.
  defs.push('<filter id="soft" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>');
  const ribbons = [
    { x0: 300, x1: 1240, yb: 178, amp: 24, h: 110, c: t.aurora[0], o: 0.85, dur: 19 },
    { x0: 470, x1: 1240, yb: 120, amp: 18, h: 80, c: t.aurora[1], o: 0.55, dur: 23 },
    { x0: 760, x1: 1240, yb: 212, amp: 12, h: 60, c: t.aurora[2], o: 0.5, dur: 17 },
  ];
  ribbons.forEach((rb, i) => {
    const shapes = [0, 1.6, 3.1].map(p => auroraShape(rb.x0, rb.x1, rb.yb, rb.amp, rb.h, p + i));
    defs.push(`<linearGradient id="au${i}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${rb.c}" stop-opacity="0"/><stop offset=".55" stop-color="${rb.c}" stop-opacity=".22"/><stop offset=".9" stop-color="${rb.c}" stop-opacity=".75"/><stop offset="1" stop-color="${rb.c}" stop-opacity=".25"/></linearGradient>`,
      `<path id="rb${i}" d="${shapes[0]}"><animate attributeName="d" dur="${rb.dur}s" repeatCount="indefinite" values="${[...shapes, shapes[0]].join(';')}" keyTimes="0;.33;.66;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/></path>`,
      `<path id="rb${i}s" d="${shapes[0]}"/>`);
    const ribbon = id => `<use href="#${id}" filter="url(#soft)"/><use href="#${id}" opacity=".5"/>`;
    body.push(`<g opacity="${rb.o}" fill="url(#au${i})" class="sway${i % 2}"><g class="motion">${ribbon(`rb${i}`)}</g><g class="still">${ribbon(`rb${i}s`)}</g></g>`);
  });
  style.push('.sway0{animation:sw 14s ease-in-out infinite alternate}.sway1{animation:sw 18s ease-in-out infinite alternate-reverse}@keyframes sw{to{transform:translateX(-36px)}}');

  // far range: low hills under the words, distant snowy peaks to the east
  const farMats = { r, rock: t.far, shade: t.farShade, snow: t.farSnow, snowShade: t.farSnowShade };
  const farPeaks = [
    { ridge: [[480, 340], [560, 300], [628, 262], [690, 286], [760, 330]], spine: [640, 340], snowY: 282 },
    { ridge: [[700, 340], [780, 280], [842, 224], [900, 262], [990, 312]], spine: [860, 340], snowY: 248 },
    { ridge: [[900, 340], [960, 270], [1010, 226], [1052, 246], [1120, 290], [1160, 300]], spine: [1030, 340], snowY: 250 },
    { ridge: [[1090, 340], [1150, 262], [1196, 232], [1240, 260]], spine: [1206, 340], snowY: 256 },
  ];
  for (const p of farPeaks) {
    const m = mountain({ ...farMats, ridge: chain(p.ridge, r, 0.26, 3), spine: p.spine, base: 340, snowY: p.snowY, fingers: 9, snowOpacity: 0.75 });
    defs.push(m.defs); body.push(m.body);
  }
  const hills = chain([[-20, 336], [90, 318], [200, 330], [320, 312], [450, 328], [560, 318], [700, 336]], r, 0.22, 3);
  body.push(`<path d="${poly([...hills, [700, 380], [-20, 380]])}" fill="${t.far}"/>`);

  // mid range: neighbours, then the horn
  const mats = { r, rock: t.rock, shade: t.rockShade, snow: t.snow, snowShade: t.snowShade };
  const mids = [
    { ridge: [[560, 372], [640, 300], [712, 214], [760, 262], [820, 320]], spine: [745, 372], snowY: 252, fingers: 14, snowOpacity: 0.82, rough: 0.22 },
    { ridge: [[1010, 372], [1060, 262], [1112, 168], [1160, 214], [1220, 250]], spine: [1150, 372], snowY: 206, fingers: 16, snowOpacity: 0.86, rough: 0.2 },
    { ridge: [[640, 372], [712, 300], [770, 226], [826, 150], [862, 102], [880, 78], [893, 74], [903, 82], [912, 101], [946, 140], [996, 186], [1050, 236], [1110, 286], [1170, 372]], spine: [930, 372], snowY: 168, fingers: 22, rough: 0.12 },
  ];
  for (const m of mids) {
    const g = mountain({ ...mats, ridge: chain(m.ridge, r, m.rough, 3), spine: m.spine, base: 372, snowY: m.snowY, fingers: m.fingers, snowOpacity: m.snowOpacity });
    defs.push(g.defs); body.push(g.body);
  }

  // distant treeline at the foot of the range
  let trees = '';
  for (let x = 520; x < 1220; x += 7 + r() * 9) {
    const y = 352 - (x - 520) * 0.058 + r() * 6, h = 9 + r() * 10;
    trees += `M${f(x - h * 0.22)} ${f(y)}L${f(x)} ${f(y - h)}L${f(x + h * 0.22)} ${f(y)}Z`;
  }
  body.push(`<path d="${trees}" fill="${t.pine}" opacity=".85"/>`);

  // far snowfall (behind the slope)
  style.push(flakeStyle(H));
  body.push(flakes(r, { n: 30, w: W, rmin: 0.5, rmax: 1.1, op: 0.55, dmin: 15, dmax: 24, color: t.text }));

  // foreground slope
  const slopeTop = [[-20, 396], [180, 386], [400, 371], [620, 352], [820, 332], [980, 313], [1100, 300], [1230, 292]];
  defs.push(`<linearGradient id="slope" x1="0" y1="290" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.snow}"/><stop offset=".55" stop-color="${t.snowShade}"/><stop offset="1" stop-color="${t.snowDeep}"/></linearGradient>`);
  body.push(`<path d="${smooth(slopeTop)}L1230 ${H + 10}L-20 ${H + 10}Z" fill="url(#slope)"/>`);
  let drifts = '';
  for (let i = 0; i < 7; i++) {
    const x = 120 + i * 160 + r() * 60, y = 400 - i * 9 + r() * 10;
    drifts += `M${f(x - 90)} ${f(y + 6)}Q${f(x)} ${f(y - 9)} ${f(x + 110)} ${f(y + 4)}`;
  }
  body.push(`<path d="${drifts}" stroke="${t.snowDeep}" stroke-width="2" opacity=".25"/>`);

  // pines framing both ends
  let pines = '';
  for (const [x, y, h] of [[1150, 304, 46], [1182, 300, 64], [1212, 306, 52], [1124, 310, 34]]) pines += pine(x, y, h, t, r);
  for (const [x, y, h] of [[22, 404, 78], [60, 412, 58], [-8, 420, 66], [96, 420, 40], [128, 422, 28]]) pines += pine(x, y, h, t, r);
  body.push(pines);

  // the run: S-turns from off-canvas right to off-canvas left
  const ySlope = x => {
    for (let i = 0; i < slopeTop.length - 1; i++) {
      const [x1, y1] = slopeTop[i], [x2, y2] = slopeTop[i + 1];
      if (x >= x1 && x <= x2) return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
    }
    return x < slopeTop[0][0] ? slopeTop[0][1] : slopeTop.at(-1)[1];
  };
  const runPts = [];
  for (let x = 1300; x >= -140; x -= 20) runPts.push([x, ySlope(x) + 24 + 12 * Math.sin((1300 - x) / 170 * Math.PI) + (1300 - x) * 0.006]);
  const runD = smooth(runPts);
  const acc = [0];
  for (let i = 1; i < runPts.length; i++) acc.push(acc[i - 1] + Math.hypot(runPts[i][0] - runPts[i - 1][0], runPts[i][1] - runPts[i - 1][1]));
  const total = acc.at(-1);
  const RUN = 7.6, CYCLE = 11, kRun = k(RUN / CYCLE);
  const apex = [];
  for (let i = 1; i < runPts.length - 1; i++) {
    const [a, b, c] = [runPts[i - 1][1], runPts[i][1], runPts[i + 1][1]];
    if ((b - a) * (c - b) < 0) apex.push({ p: runPts[i], at: acc[i] / total * RUN / CYCLE });
  }
  const loop = `dur="${CYCLE}s" repeatCount="indefinite"`;
  const motion = begin => `<animateMotion ${loop} begin="${begin}s" path="${runD}" keyPoints="0;1;1" keyTimes="0;${kRun};1" calcMode="linear"/>`;

  // ski tracks, drawn behind him and fading during the pause
  const track = (dy, w, o, begin) => `<path d="${runD}"${dy ? ` transform="translate(0 ${dy})"` : ''} pathLength="1000" stroke-width="${w}" stroke-dasharray="1000" stroke-dashoffset="1000" opacity="${o}">`
    + `<animate attributeName="stroke-dashoffset" ${loop} begin="${begin}s" values="1000;0;0" keyTimes="0;${kRun};1"/>`
    + `<animate attributeName="opacity" ${loop} values="${o};${o};0" keyTimes="0;${kRun};1"/></path>`;
  body.push(`<g class="motion" stroke="${t.snowDeep}" stroke-linecap="round">${track(0, 2.4, 0.7, 0)}${track(5, 2, 0.5, 0.04)}</g>`);

  // spray at each turn
  let spray = '';
  apex.forEach((a, i) => {
    const dir = i % 2 ? 1 : -1;
    for (let j = 0; j < 7; j++) {
      const dx = 12 + r() * 26, dy = -(5 + r() * 18), rad = 1.2 + r() * 2.2;
      const t0 = k(Math.max(0, a.at - 0.004)), t1 = k(a.at + 0.012), t2 = k(Math.min(0.999, a.at + 0.08));
      spray += `<circle cx="${f(a.p[0] + 8)}" cy="${f(a.p[1] - 3)}" r="${f(rad)}" opacity="0">`
        + `<animate attributeName="opacity" ${loop} values="0;0;.95;0;0" keyTimes="0;${t0};${t1};${t2};1"/>`
        + `<animateTransform attributeName="transform" type="translate" ${loop} values="0 0;0 0;${f(dx * 0.35)} ${f(dy * 0.4)};${f(dx)} ${f(dy + dir * 4)};${f(dx)} ${f(dy)}" keyTimes="0;${t0};${t1};${t2};1"/></circle>`;
    }
  });
  body.push(`<g class="motion" fill="${t.snow}">${spray}</g>`);

  // penguin in goggles; negative begin = already mid-cycle at load, trailing Simon by 0.85s
  body.push(`<g class="motion"><g>${penguin(t, 1.35)}${motion(-(CYCLE - 0.85))}</g></g>`);

  // Simon, alternating carve frames at every turn
  const S = 0.6;
  defs.push(sprite('carveA', 'ski-carve-a', S), sprite('carveB', 'ski-carve-b', S));
  const keys = ['0', ...apex.map(a => k(a.at)), kRun, '1'];
  const frames = on => keys.map((_, i) => ((i % 2 === 0) === on ? 1 : 0)).join(';');
  const frameAnim = on => `<animate attributeName="opacity" ${loop} calcMode="discrete" values="${frames(on)}" keyTimes="${keys.join(';')}"/>`;
  body.push(`<g class="motion"><g><ellipse rx="30" ry="4.5" fill="${t.snowDeep}" opacity=".45"/>`
    + `<use href="#carveA">${frameAnim(true)}</use><use href="#carveB" opacity="0">${frameAnim(false)}</use>${motion(0)}</g></g>`);
  const still = runPts[Math.round(runPts.length * 0.42)];
  body.push(`<g class="still" transform="translate(${f(still[0])} ${f(still[1])})"><ellipse rx="30" ry="4.5" fill="${t.snowDeep}" opacity=".45"/><use href="#carveA"/></g>`);

  // near snowfall
  body.push(flakes(r, { n: 18, w: W, rmin: 1.1, rmax: 2, op: 0.75, dmin: 10, dmax: 15, sway: true, color: t.text }),
    flakes(r, { n: 7, w: W, rmin: 2.2, rmax: 3.2, op: 0.85, dmin: 7, dmax: 10, sway: true, color: t.text }));

  // words
  const greet = text(content.greeting, { x: 66, y: 112, size: 30, weight: 300 });
  const name = text(content.name, { x: 58, y: 212, size: 118, weight: 400, tracking: -0.04 });
  const dot = text('.', { x: 58 + name.width + 2, y: 212, size: 118, weight: 400 });
  const tag = text(content.tagline, { x: 66, y: 260, size: 27, weight: 300 });
  body.push(`<path d="${greet.d}" fill="${t.muted}"/><path d="${name.d}" fill="${t.text}"/><path d="${dot.d}" fill="${t.accent}"/><path d="${tag.d}" fill="${t.muted}"/>`);

  // typed line: one clip rect steps through every keystroke; each phrase only switches on/off
  const TY = 306, TX = 92, size = 25;
  const gs = glyphSet('h');
  const prompt = text('›', { x: 66, y: TY, size, weight: 500 });
  const phrases = content.typing.map(p => gs.run(p, { x: TX, y: TY, size, weight: 400 }));
  const TYPE = 0.065, ERASE = 0.028, HOLD = 1.9, GAP = 0.4;
  let clock = 0;
  const steps = [], spans = [];
  phrases.forEach(p => {
    const ends = p.glyphs.map(g => g.x + g.w - TX);
    const from = clock;
    steps.push([clock, 0]);
    ends.forEach((w, i) => steps.push([clock + (i + 1) * TYPE, w]));
    clock += ends.length * TYPE + HOLD;
    for (let i = ends.length - 2; i >= -1; i--) { clock += ERASE; steps.push([clock, i >= 0 ? ends[i] : 0]); }
    spans.push([from, clock]);
    clock += GAP;
  });
  const TOTAL = f(clock), kt = steps.map(s => k(s[0] / clock)).join(';');
  const tloop = `dur="${TOTAL}s" repeatCount="indefinite" calcMode="discrete"`;
  defs.push(gs.defs(), `<clipPath id="typed"><rect x="${TX - 2}" y="${TY - 30}" height="40" width="0"><animate attributeName="width" ${tloop} values="${steps.map(s => f(s[1] + 2)).join(';')}" keyTimes="${kt}"/></rect></clipPath>`);
  const typed = phrases.map((p, i) => {
    const [a, b] = spans[i].map(v => k(v / clock));
    const anim = i === 0 ? `values="1;0" keyTimes="0;${b}"` : `values="0;1;0" keyTimes="0;${a};${b}"`;
    return `<g opacity="${i ? 0 : 1}">${p.svg}<animate attributeName="opacity" ${tloop} ${anim}/></g>`;
  }).join('');
  body.push(`<path d="${prompt.d}" fill="${t.muted}"/>`,
    `<g class="motion"><g clip-path="url(#typed)" fill="${t.accent}">${typed}</g>`
    + `<g><rect class="caret" x="${TX + 3}" y="${TY - 21}" width="2.6" height="26" rx="1.3" fill="${t.accent}"/><animateTransform attributeName="transform" type="translate" ${tloop} values="${steps.map(s => `${f(s[1])} 0`).join(';')}" keyTimes="${kt}"/></g></g>`,
    `<g class="still" fill="${t.accent}">${phrases[0].svg}</g>`);
  style.push('.caret{animation:bl 1.05s steps(1) infinite}@keyframes bl{50%{opacity:0}}');

  const scene = `<g clip-path="url(#frame)">${body.join('')}</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" stroke="${t.line}" opacity=".9"/>`;
  return doc({
    width: W, height: H,
    title: `${content.greeting} ${content.name}. ${content.tagline}`,
    desc: 'Animated alpine night: under a citron aurora, Simon carves down a snowy slope while a penguin in ski goggles slides after him. A typed line cycles through: ' + content.typing.join('; ') + '.',
    style: style.join(''), defs: defs.join(''), body: scene,
  });
}
