// Project cards: a small looping scene that shows what the project does,
// next to the repo name, tagline, description and stack.
import { text, wrap } from '../lib/font.mjs';
import { doc, f, k, rng } from '../lib/svg.mjs';
import { sprite } from '../lib/scene.mjs';

const W = 600, H = 300;
const SX = 22, SY = 22, SW = 236, SH = 256; // the scene stage

// SMIL helper: animate an attribute through values at fractions of a loop.
const anim = (attr, dur, frames, extra = '') => {
  const keys = frames.map(([at]) => k(at)).join(';');
  const vals = frames.map(([, v]) => v).join(';');
  return `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite" keyTimes="${keys}" values="${vals}"${extra}/>`;
};
// keySplines must stay inside 0..1, so "springy" moves get an explicit overshoot keyframe instead.
const ease = n => ` calcMode="spline" keySplines="${Array(n - 1).fill('.4 0 .2 1').join(';')}"`;
const tf = (type, dur, frames, extra = '') => {
  const keys = frames.map(([at]) => k(at)).join(';');
  const vals = frames.map(([, v]) => v).join(';');
  return `<animateTransform attributeName="transform" type="${type}" dur="${dur}s" repeatCount="indefinite" keyTimes="${keys}" values="${vals}"${extra}/>`;
};

const scenes = {
  // triolFM: the cursor hovers the island, which springs open into the player
  island(t) {
    const D = 8, cx = SW / 2;
    const pill = (x, y, w, h, rx) => ({ x: cx - w / 2 + x, y, w, h, rx });
    const idle = pill(0, 18, 108, 30, 15), peek = pill(0, 18, 150, 34, 17), open = pill(0, 18, 210, 132, 28);
    const over = pill(0, 18, 216, 138, 29); // a little overshoot as it springs open
    const at = [0, 0.18, 0.24, 0.32, 0.4, 0.45, 0.48, 0.84, 0.9, 1];
    const st = [idle, idle, peek, idle, idle, over, open, open, idle, idle];
    const sp = ` calcMode="spline" keySplines="${at.slice(1).map(() => '.25 .8 .3 1').join(';')}"`;
    const geo = ['x', 'y', 'width', 'height', 'rx'].map(a => anim(a, D, at.map((v, i) => [v, f(st[i][a === 'width' ? 'w' : a === 'height' ? 'h' : a])]), sp)).join('');
    const showIdle = anim('opacity', D, [[0, 1], [0.18, 1], [0.2, 0], [0.3, 0], [0.32, 1], [0.4, 1], [0.42, 0], [0.86, 0], [0.9, 1], [1, 1]]);
    const showOpen = anim('opacity', D, [[0, 0], [0.47, 0], [0.52, 1], [0.82, 1], [0.84, 0], [1, 0]]);
    const showPeek = anim('opacity', D, [[0, 0], [0.19, 0], [0.22, 1], [0.29, 1], [0.32, 0], [1, 0]]);
    let bars = '';
    for (let i = 0; i < 5; i++) bars += `<rect x="${f(cx + 18 + i * 6)}" y="27" width="3.4" height="12" rx="1.7" fill="${t.accent}" class="eq" style="animation-delay:-${f(i * 0.17)}s;animation-duration:${f(0.7 + (i % 3) * 0.18)}s"/>`;
    const o = open;
    const playX = o.x + o.w / 2, ctrlY = o.y + 108;
    return {
      style: `.eq{transform-box:fill-box;transform-origin:50% 100%;animation:eq .8s ease-in-out infinite alternate}@keyframes eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}`,
      defs: `<linearGradient id="cover" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.accent}"/><stop offset="1" stop-color="#6fc6ae"/></linearGradient>`
        + `<radialGradient id="wall" cx=".3" cy=".9" r=".9"><stop stop-color="${t.hover}"/><stop offset="1" stop-color="${t.raised}"/></radialGradient>`,
      body: `<rect width="${SW}" height="${SH}" fill="url(#wall)"/>`
        // a quiet desktop under the island: one window, one dock
        + `<rect x="30" y="164" width="176" height="56" rx="9" fill="${t.surface}" opacity=".7" stroke="${t.line}"/>`
        + `<circle cx="42" cy="175" r="2.6" fill="${t.line}"/><circle cx="51" cy="175" r="2.6" fill="${t.line}"/><circle cx="60" cy="175" r="2.6" fill="${t.line}"/>`
        + `<rect x="42" y="188" width="74" height="6" rx="3" fill="${t.line}"/><rect x="42" y="200" width="112" height="6" rx="3" fill="${t.line}" opacity=".7"/>`
        + `<rect x="63" y="228" width="110" height="20" rx="10" fill="${t.surface}" opacity=".8" stroke="${t.line}"/>`
        + [0, 1, 2, 3, 4].map(i => `<rect x="${71 + i * 20}" y="232" width="12" height="12" rx="3.5" fill="${i === 2 ? t.accent : t.line}"/>`).join('')
        + `<rect x="${idle.x}" y="${idle.y}" width="${idle.w}" height="${idle.h}" rx="${idle.rx}" fill="#050806">${geo}</rect>`
        + `<g>${showIdle}<rect x="${f(cx - 46)}" y="23" width="20" height="20" rx="5" fill="url(#cover)"/>${bars}</g>`
        + `<g opacity="0">${showPeek}<rect x="${f(cx - 66)}" y="24" width="22" height="22" rx="5" fill="url(#cover)"/><rect x="${f(cx - 36)}" y="28" width="58" height="6" rx="3" fill="#eaf0e6"/><rect x="${f(cx - 36)}" y="38" width="38" height="5" rx="2.5" fill="#a5b2a5"/></g>`
        + `<g opacity="0">${showOpen}`
        + `<rect x="${f(o.x + 16)}" y="${f(o.y + 16)}" width="58" height="58" rx="12" fill="url(#cover)"/>`
        + `<rect x="${f(o.x + 86)}" y="${f(o.y + 26)}" width="96" height="9" rx="4.5" fill="#eaf0e6"/><rect x="${f(o.x + 86)}" y="${f(o.y + 44)}" width="62" height="7" rx="3.5" fill="#a5b2a5"/>`
        + `<rect x="${f(o.x + 16)}" y="${f(o.y + 86)}" width="${f(o.w - 32)}" height="4" rx="2" fill="#27352b"/>`
        + `<rect x="${f(o.x + 16)}" y="${f(o.y + 86)}" width="40" height="4" rx="2" fill="${t.accent}">${anim('width', D, [[0, 40], [0.5, 40], [0.84, 110], [1, 110]])}</rect>`
        + `<path d="M${f(playX - 6)} ${f(ctrlY - 8)}l13 8-13 8z" fill="#eaf0e6"/>`
        + `<path d="M${f(playX - 40)} ${f(ctrlY - 7)}v14M${f(playX - 38)} ${f(ctrlY)}l10-7v14z" stroke="#eaf0e6" stroke-width="2.4" fill="#eaf0e6" stroke-linejoin="round"/>`
        + `<path d="M${f(playX + 40)} ${f(ctrlY - 7)}v14M${f(playX + 38)} ${f(ctrlY)}l-10-7v14z" stroke="#eaf0e6" stroke-width="2.4" fill="#eaf0e6" stroke-linejoin="round"/></g>`
        // cursor: arrives, hovers (island opens), leaves (island folds)
        + `<g transform="translate(200 230)"><path d="M0 0v17l4.6-4.4 3 7 3-1.3-3-6.8h6.4z" fill="#ffffff" stroke="#050806" stroke-width="1.4" stroke-linejoin="round"/>`
        + tf('translate', D, [[0, '200 230'], [0.34, '200 230'], [0.44, '150 40'], [0.82, '154 46'], [0.9, '210 236'], [1, '210 236']], ease(6)) + '</g>',
    };
  },

  // PlayerScale: one player resizes smoothly next to a normal-sized friend
  scale(t) {
    const D = 7.5;
    const voxel = (main, shade, skin) => `<rect x="-11" y="-74" width="22" height="22" rx="2" fill="${skin}"/><rect x="-11" y="-74" width="22" height="7" fill="${shade}"/>`
      + `<rect x="-6" y="-63" width="4" height="4" fill="#1b2a1f"/><rect x="2" y="-63" width="4" height="4" fill="#1b2a1f"/>`
      + `<rect x="-12" y="-52" width="24" height="26" rx="2" fill="${main}"/><rect x="-20" y="-52" width="8" height="24" rx="2" fill="${shade}"/><rect x="12" y="-52" width="8" height="24" rx="2" fill="${shade}"/>`
      + `<rect x="-12" y="-26" width="11" height="26" rx="2" fill="#3c4a5c"/><rect x="1" y="-26" width="11" height="26" rx="2" fill="#2f3b4a"/>`;
    const scales = [[0, 1], [0.12, 1], [0.24, 0.5], [0.4, 0.5], [0.55, 2], [0.78, 2], [0.92, 1], [1, 1]];
    const labels = [['×0.5', 0.24, 0.4], ['×2.0', 0.55, 0.78]];
    const knob = scales.map(([at, s]) => [at, f(40 + (Math.log10(s) + 1) / 2 * 156)]);
    let tags = `<g>${anim('opacity', D, [[0, 1], [0.13, 1], [0.15, 0], [0.9, 0], [0.92, 1], [1, 1]])}<path d="${text('×1.0', { x: SW / 2, y: 40, size: 22, weight: 500, anchor: 'middle' }).d}" fill="${t.text}"/></g>`;
    for (const [s, a, b] of labels) tags += `<g opacity="0">${anim('opacity', D, [[0, 0], [k(a - 0.02), 0], [a, 1], [b, 1], [k(b + 0.02), 0], [1, 0]])}<path d="${text(s, { x: SW / 2, y: 40, size: 22, weight: 500, anchor: 'middle' }).d}" fill="${t.accent}"/></g>`;
    return {
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>`
        + `<path d="M20 196h196l-14 14H34z" fill="${t.hover}"/><path d="M34 210h168v8H34z" fill="${t.line}"/>`
        + `<g transform="translate(76 198)" opacity=".55">${voxel('#7d8f79', '#5f705c', '#c9a27e')}</g>`
        + `<g transform="translate(152 198)"><g>${tf('scale', D, scales.map(([at, s]) => [at, `${s} ${s}`]), ease(scales.length))}${voxel(t.accent, t.name === 'dark' ? '#a9c46e' : '#3f5620', '#e0b48c')}</g></g>`
        + tags
        + `<rect x="40" y="234" width="156" height="4" rx="2" fill="${t.line}"/>`
        + `<circle cx="118" cy="236" r="7.5" fill="${t.accent}" stroke="${t.raised}" stroke-width="2">${anim('cx', D, knob, ease(knob.length))}</circle>`,
    };
  },

  // UXL: a 32px button gets cited, then grows to a 44px target
  law(t) {
    const D = 7;
    const warn = t.name === 'dark' ? '#f2a479' : '#b4532a';
    const btn = (h, color) => `<rect x="46" y="${f(176 - h)}" width="104" height="${h}" rx="${f(h / 2)}" fill="${color}"/>`;
    const lbl = (s, c, y, size = 14) => `<path d="${text(s, { x: 178, y, size, weight: 500 }).d}" fill="${c}"/>`;
    return {
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>`
        + `<rect x="30" y="24" width="136" height="214" rx="22" fill="${t.surface}" stroke="${t.line}" stroke-width="2"/><rect x="80" y="34" width="36" height="7" rx="3.5" fill="${t.line}"/>`
        + `<rect x="46" y="62" width="90" height="10" rx="5" fill="${t.text}" opacity=".85"/><rect x="46" y="82" width="104" height="6" rx="3" fill="${t.muted}" opacity=".6"/><rect x="46" y="96" width="80" height="6" rx="3" fill="${t.muted}" opacity=".6"/><rect x="46" y="118" width="104" height="30" rx="8" fill="${t.hover}"/>`
        // the small button and its verdict
        + `<g>${anim('opacity', D, [[0, 1], [0.46, 1], [0.48, 0], [0.98, 0], [1, 1]])}${btn(20, t.muted)}`
        + `<path d="M162 156v20M158 156h8M158 176h8" stroke="${warn}" stroke-width="2"/>${lbl('32 px', warn, 171)}`
        + `<g>${anim('opacity', D, [[0, 0], [0.18, 0], [0.24, 1], [1, 1]])}<path d="M178 192l10 10m0-10l-10 10" stroke="${warn}" stroke-width="2.6" stroke-linecap="round"/></g></g>`
        // the fix
        + `<g opacity="0">${anim('opacity', D, [[0, 0], [0.48, 0], [0.51, 1], [0.96, 1], [0.98, 0], [1, 0]])}${btn(30, t.accent)}`
        + `<path d="M162 146v30M158 146h8M158 176h8" stroke="${t.accent}" stroke-width="2"/>${lbl('44 px', t.accent, 166)}`
        + `<path d="M179 196l6 6 11-12" stroke="${t.accent}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<rect x="18" y="200" width="${f(text('Fitts’s law', { size: 13, weight: 500 }).width + 22)}" height="24" rx="12" fill="${t.surface}" stroke="${t.accent}"/>`
        + `<path d="${text('Fitts’s law', { x: 29, y: 216.5, size: 13, weight: 500 }).d}" fill="${t.accent}"/></g>`
        // a thumb taps the fixed button
        + `<circle cx="98" cy="161" r="10" fill="${t.text}" opacity="0">${anim('opacity', D, [[0, 0], [0.62, 0], [0.66, 0.45], [0.74, 0], [1, 0]])}${anim('r', D, [[0, 8], [0.62, 8], [0.74, 26], [1, 26]])}</circle>`,
    };
  },

  // awards: a page assembles itself, a laurel grows around it
  laurel(t) {
    const D = 8, cx = SW / 2, cy = 128, R = 88;
    let leaves = '';
    // two branches rise from the bottom and open at the top; leaves sit along the arc, tilted outward
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const phi = (90 + side * (22 + i * 16)) * Math.PI / 180; // SVG angles: 90° is straight down
        const x = cx + R * Math.cos(phi), y = cy + R * Math.sin(phi);
        const rot = phi * 180 / Math.PI + 90 + side * 28;
        const at = 0.3 + i * 0.03;
        leaves += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="5.2" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="${t.accent}">${anim('opacity', D, [[0, 0], [at, 0], [k(at + 0.04), 1], [0.9, 1], [0.96, 0], [1, 0]])}</ellipse>`;
      }
    }
    leaves += `<path d="M${cx - 30} ${cy + R - 2}Q${cx} ${cy + R + 12} ${cx + 30} ${cy + R - 2}" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" fill="none">${anim('opacity', D, [[0, 0], [0.28, 0], [0.32, 1], [0.9, 1], [0.96, 0], [1, 0]])}</path>`;
    // opacity attributes hold the finished page: that is the still frame under reduced motion
    const block = (x, y, w, h, c, at, rx = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}">${anim('opacity', D, [[0, 0], [at, 0], [k(at + 0.05), 1], [0.9, 1], [0.96, 0], [1, 0]])}</rect>`;
    return {
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>`
        + `<rect x="58" y="76" width="120" height="100" rx="10" fill="${t.surface}" stroke="${t.line}" stroke-width="1.5"/>`
        + `<circle cx="70" cy="87" r="2.6" fill="${t.line}"/><circle cx="79" cy="87" r="2.6" fill="${t.line}"/><circle cx="88" cy="87" r="2.6" fill="${t.line}"/>`
        + block(68, 100, 70, 10, t.text, 0.04) + block(68, 116, 50, 6, t.muted, 0.1)
        + block(68, 130, 100, 36, t.accent, 0.16, 6) + block(144, 100, 24, 22, t.hover, 0.22)
        + leaves
        + `<g opacity="0">${anim('opacity', D, [[0, 0], [0.62, 0], [0.66, 1], [0.74, 0], [1, 0]])}<path d="M${cx} 34l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="${t.accent}"/></g>`,
    };
  },

  // spoter: song cards swiped right with a heart
  swipe(t) {
    // Two cards trade places: each is swiped off, reappears at the back, and moves forward again.
    // Card B runs the same timeline half a loop later (negative begin), so the loop never jumps.
    const D = 8.8, covers = [[t.accent, '#6fc6ae'], ['#f2a479', '#c9668a']];
    const FRONT = '118 128', BACK = '118 137', DRAG = '172 120', GONE = '336 100';
    const moves = (begin, cover, first) => {
      const b = ` begin="${begin}s"`;
      const tr = tf('translate', D, [[0, FRONT], [0.14, FRONT], [0.26, DRAG], [0.36, GONE], [0.37, BACK], [0.64, BACK], [0.86, FRONT], [1, FRONT]], b + ease(8));
      const rot = tf('rotate', D, [[0, '0'], [0.14, '0'], [0.26, '9'], [0.36, '22'], [0.37, '0'], [1, '0']], b + ease(6));
      const sc = tf('scale', D, [[0, '1'], [0.37, '1'], [0.38, '.92'], [0.64, '.92'], [0.86, '1'], [1, '1']], b + ease(6));
      const op = anim('opacity', D, [[0, 1], [0.36, 1], [0.37, 0], [0.42, 0], [0.5, 1], [1, 1]], b);
      const heart = anim('opacity', D, [[0, 0], [0.17, 0], [0.24, 1], [0.36, 1], [0.37, 0], [1, 0]], b);
      const inner = `<g transform="translate(${FRONT})">${tr}<g>${rot}<g>${sc}<g>${op}`
        + `<rect x="-58" y="-82" width="116" height="164" rx="16" fill="${t.surface}" stroke="${t.line}" stroke-width="1.5"/>`
        + `<rect x="-46" y="-70" width="92" height="92" rx="10" fill="url(#${cover})"/>`
        + `<rect x="-46" y="34" width="70" height="8" rx="4" fill="${t.text}"/><rect x="-46" y="50" width="46" height="6" rx="3" fill="${t.muted}"/>`
        + `<circle cx="34" cy="50" r="10" fill="${t.hover}"/><path d="M31 45.5l8 4.5-8 4.5z" fill="${t.text}"/>`
        + `<g opacity="0" transform="rotate(-12)">${heart}<rect x="-30" y="-62" width="62" height="28" rx="8" stroke="${t.accent}" stroke-width="2.5" fill="${t.surface}"/><path d="M-11-49c0-6 8-8 10-2 2-6 10-4 10 2 0 5-10 11-10 11s-10-6-10-11z" fill="${t.accent}"/></g>`
        + '</g></g></g></g>';
      // SVG has no z-index: the card lives on a back layer while waiting and a front layer while on top
      const role = values => `<animate attributeName="opacity" dur="${D}s"${b} repeatCount="indefinite" calcMode="discrete" keyTimes="0;.37;.86" values="${values}"/>`;
      return { front: `<g${first ? '' : ' opacity="0"'}>${role('1;0;1')}${inner}</g>`, back: `<g opacity="0">${role('0;1;0')}${inner}</g>` };
    };
    const A = moves(0, 'cv0', true), B = moves(-D / 2, 'cv1', false);
    return {
      defs: covers.map(([a, b], i) => `<linearGradient id="cv${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join(''),
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>${A.back}${B.back}${A.front}${B.front}`,
    };
  },

  // Shred360: Simon on a turntable, in ski gear
  spin(t) {
    const D = 5;
    const turn = [[0, '1 1'], [0.25, '.08 1'], [0.5, '-1 1'], [0.75, '-.08 1'], [1, '1 1']];
    return {
      defs: sprite('rider', 'ski-wave', 0.86),
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>`
        + `<ellipse cx="${SW / 2}" cy="208" rx="82" ry="20" fill="${t.hover}"/><ellipse cx="${SW / 2}" cy="204" rx="82" ry="20" fill="${t.surface}" stroke="${t.line}" stroke-width="1.5"/>`
        + `<ellipse cx="${SW / 2}" cy="204" rx="66" ry="14" stroke="${t.accent}" stroke-width="2.5" stroke-dasharray="10 14" fill="none"><animate attributeName="stroke-dashoffset" dur="1.6s" repeatCount="indefinite" values="0;-48"/></ellipse>`
        + `<g transform="translate(${SW / 2} 206)"><g>${tf('scale', D, turn, ' calcMode="spline" keySplines=".37 0 .63 1;.37 0 .63 1;.37 0 .63 1;.37 0 .63 1"')}<use href="#rider"/></g></g>`
        + `<path d="M40 46a52 15 0 1 1 18 11" stroke="${t.muted}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M62 54l-6 6-2-9z" fill="${t.muted}"/>`
        + `<path d="${text('360°', { x: 158, y: 52, size: 18, weight: 500 }).d}" fill="${t.text}"/>`,
    };
  },
};

export function card(p, t) {
  const r = rng(p.repo.length * 97);
  const dark = t.name === 'dark';
  const bg = dark ? t.surface : '#eef1ea';
  const TX = 284, TW = 290;
  const scene = scenes[p.scene](t, r);

  // Cards show at ~425px wide on a profile, so type is sized for that (≈12px on screen at the smallest).
  const name = text(p.repo, { x: TX, y: 66, size: 34, weight: 500, tracking: -0.01 });
  const tagLines = wrap(p.tagline, TW, { size: 20, weight: 400 });
  let y = 101, words = '';
  for (const line of tagLines) { words += `<path d="${text(line, { x: TX, y, size: 20, weight: 400 }).d}" fill="${t.accent}"/>`; y += 25.5; }
  y += 6;
  const desc = wrap(p.description, TW, { size: 17, weight: 400 });
  if (desc.length > 3 || y + (desc.length - 1) * 23.5 > 226) console.warn(`::warning::${p.repo}: description too long for the card, shorten it in scripts/content.mjs`);
  for (const line of desc.slice(0, 3)) {
    words += `<path d="${text(line, { x: TX, y, size: 17, weight: 400 }).d}" fill="${t.muted}"/>`;
    y += 23.5;
  }
  // stack chips along the bottom
  let cx = TX, chips = '';
  for (const s of p.stack) {
    const label = text(s, { x: cx + 12, y: 260.5, size: 14.5, weight: 500 });
    const w = label.width + 24;
    if (cx + w > W - 20) { console.warn(`::warning::${p.repo}: stack chip "${s}" does not fit`); break; }
    chips += `<rect x="${f(cx)}" y="241" width="${f(w)}" height="28" rx="14" stroke="${t.line}" fill="${dark ? t.raised : '#f7f9f5'}"/><path d="${label.d}" fill="${t.text}"/>`;
    cx += w + 7;
  }
  const arrow = `<path d="M${W - 48} 58l14-14M${W - 45} 44h11v11" stroke="${t.muted}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  return doc({
    width: W, height: H,
    title: `${p.repo}: ${p.tagline}`,
    desc: `${p.repo}. ${p.tagline} ${p.description} Stack: ${p.stack.join(', ')}.`,
    style: scene.style ?? '',
    defs: `<clipPath id="stage"><rect width="${SW}" height="${SH}" rx="14"/></clipPath>${scene.defs ?? ''}`,
    body: `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="18" fill="${bg}" stroke="${t.line}" stroke-width="1.5"/>`
      // reduced motion: SMIL can't be paused from CSS, so a copy without <animate*> stands in
      + `<g transform="translate(${SX} ${SY})" clip-path="url(#stage)"><g class="motion">${scene.body}</g>`
      + `<g class="still">${scene.body.replace(/<animate(?:Transform|Motion)?\b[^>]*\/>/g, '')}</g></g>`
      + `<path d="${name.d}" fill="${t.text}"/>${arrow}${words}${chips}`,
  });
}
