// Project cards: a small looping scene that shows what the project does,
// next to the repo name, tagline, description and stack.
import { text, wrap } from '../lib/font.mjs';
import { doc, f, k, rng } from '../lib/svg.mjs';
import { auroraShape, pine } from '../lib/scene.mjs';
import { themes } from '../lib/theme.mjs';

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

  // AwardComponents: the cell-curtain demo on its workbench. The curtain weaves shut and open,
  // the cell width is dragged smaller, it runs again with finer cells, and the prompt is copied.
  curtain(t) {
    const D = 10, dark = t.name === 'dark';
    const AX = 26, AY = 38, AW = 184, AH = 100; // the demo's page inside the preview window
    // One sweep, as in the component: cells grow from hairlines into bars by grid distance from
    // the bottom-right cell, hold shut while the page swaps behind them, then open in the same order.
    const SP = 0.06, DD = 0.04, HOLD = 0.02;
    const sweep = (s, cols, rows) => {
      const cw = AW / cols, ch = AH / rows, max = Math.hypot(cols - 1, rows - 1);
      let out = '';
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const u = Math.hypot(cols - 1 - i, rows - 1 - j) / max;
        const c0 = s + u * SP, o0 = s + SP + DD + HOLD + u * SP;
        const frames = [[0, '0 1'], [c0, '0 1'], [c0 + DD, '1 1'], [o0, '1 1'], [o0 + DD, '0 1'], [1, '0 1']];
        out += `<g transform="translate(${f(AX + i * cw)} ${f(AY + j * ch)})"><rect width="${f(cw + 0.6)}" height="${f(ch + 0.6)}" fill="${t.accent}" transform="scale(0 1)">${tf('scale', D, frames, ease(frames.length))}</rect></g>`;
      }
      return out;
    };
    const W1 = 0.05, W2 = 0.52, shut = s => s + SP + DD + HOLD / 2;

    // two pages of a speaker's launch site: Overview, then Sound
    const head = s => `<path d="${text(s, { x: AX + 12, y: AY + 28, size: 18, weight: 600 }).d}" fill="${t.text}"/>`;
    const sx = AX + 143, sy = AY + 50;
    const pageA = `<rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" fill="${dark ? t.raised : '#f7f9f5'}"/>${head('Kova One')}`
      + `<rect x="${AX + 12}" y="${AY + 40}" width="78" height="6" rx="3" fill="${t.muted}" opacity=".55"/><rect x="${AX + 12}" y="${AY + 52}" width="58" height="6" rx="3" fill="${t.muted}" opacity=".55"/>`
      + `<rect x="${AX + 12}" y="${AY + 70}" width="44" height="16" rx="8" fill="${t.text}"/>`
      + `<rect x="${sx - 24}" y="${AY + 12}" width="48" height="76" rx="13" fill="${dark ? '#2e3d32' : '#26332a'}"/>`
      + `<circle cx="${sx}" cy="${sy + 12}" r="16" fill="${dark ? '#1b251f' : '#3a4a3d'}"/><circle cx="${sx}" cy="${sy + 12}" r="6.5" fill="${dark ? '#3c4d40' : '#56685a'}"/>`
      + `<circle cx="${sx}" cy="${AY + 28}" r="5" fill="${dark ? '#1b251f' : '#3a4a3d'}"/>`;
    let wave = '';
    for (let i = 0; i < 17; i++) {
      const h = 6 + 40 * Math.abs(Math.sin(i * 0.82) * Math.cos(i * 0.31));
      wave += `<rect x="${f(AX + 13 + i * 9.6)}" y="${f(AY + 66 - h / 2)}" width="5" height="${f(h)}" rx="2.5" fill="${i % 3 === 1 ? t.muted : t.text}"/>`;
    }
    const pageB = `<rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" fill="${t.hover}"/>${head('Sound')}${wave}`;
    const swap = `<animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${k(shut(W1))};${k(shut(W2))}" values="0;1;0"/>`;

    // the control: Cell width, 80 px dragged down to 40 px (range 40–160)
    const TX0 = 24, TWD = 188, kx0 = TX0 + TWD * (80 - 40) / 120, kx1 = TX0;
    const DRAG = [0.33, 0.45], RESET = [0.95, 0.99];
    const knob = [[0, kx0], [DRAG[0], kx0], [DRAG[1], kx1], [RESET[0], kx1], [RESET[1], kx0], [1, kx0]];
    const value = (s, c, frames) => `<g${frames[0][1] ? '' : ' opacity="0"'}>${anim('opacity', D, frames)}<path d="${text(s, { x: 214, y: 172, size: 14, weight: 500, anchor: 'end' }).d}" fill="${c}"/></g>`;
    const swapAt = (DRAG[0] + DRAG[1]) / 2;

    // the prompt button, and its copied state
    const BY = 204, BH = 36, BC = 118;
    const lbl = (s, c, icon) => {
      const L = text(s, { size: 14, weight: 500 }), x = BC - (L.width + 20) / 2;
      return icon(x, c) + `<path d="${text(s, { x: x + 20, y: BY + 23, size: 14, weight: 500 }).d}" fill="${c}"/>`;
    };
    const copyIcon = (x, c) => `<rect x="${f(x + 3.5)}" y="${BY + 10.5}" width="9" height="11" rx="2.2" stroke="${c}" stroke-width="1.6"/><path d="M${f(x)} ${BY + 22.5}v-9.3a2 2 0 0 1 2-2" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
    const checkIcon = (x, c) => `<path d="M${f(x)} ${BY + 18}l4 4 8-9" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    const CLICK = 0.845, COPIED = [0.855, 0.95, 0.97];

    // the pointer: rests on the demo, drags the knob, watches, then copies the prompt
    const REST = '200 118', WATCH = '152 112', PRESS = `194 ${BY + 20}`;
    const cursor = [[0, REST], [0.27, REST], [DRAG[0] - 0.01, `${f(kx0)} 186`], [DRAG[0], `${f(kx0)} 186`], [DRAG[1], `${kx1} 186`], [DRAG[1] + 0.02, `${kx1} 186`],
      [0.53, WATCH], [0.77, WATCH], [CLICK - 0.01, PRESS], [CLICK + 0.02, PRESS], [0.93, REST], [1, REST]];

    return {
      defs: `<clipPath id="page"><rect x="${AX}" y="${AY}" width="${AW}" height="${AH}" rx="7"/></clipPath>`,
      body: `<rect width="${SW}" height="${SH}" fill="${t.raised}"/>`
        // preview window
        + `<rect x="16" y="14" width="204" height="134" rx="12" fill="${t.surface}" stroke="${t.line}" stroke-width="1.5"/>`
        + `<circle cx="28" cy="26" r="2.6" fill="${t.line}"/><circle cx="37" cy="26" r="2.6" fill="${t.line}"/><circle cx="46" cy="26" r="2.6" fill="${t.line}"/>`
        + `<rect x="64" y="21" width="108" height="10" rx="5" fill="${t.hover}"/>`
        + `<g clip-path="url(#page)">${pageA}<g opacity="0">${swap}${pageB}</g>${sweep(W1, 4, 2)}${sweep(W2, 8, 4)}</g>`
        // control
        + `<path d="${text('Cell width', { x: 22, y: 172, size: 14, weight: 500 }).d}" fill="${t.text}"/>`
        + value('80 px', t.muted, [[0, 1], [swapAt - 0.01, 1], [swapAt + 0.01, 0], [RESET[1] - 0.01, 0], [RESET[1], 1], [1, 1]])
        + value('40 px', t.accent, [[0, 0], [swapAt - 0.01, 0], [swapAt + 0.01, 1], [RESET[1] - 0.01, 1], [RESET[1], 0], [1, 0]])
        + `<rect x="${TX0}" y="184" width="${TWD}" height="4" rx="2" fill="${t.line}"/>`
        + `<rect x="${TX0}" y="184" width="${f(kx0 - TX0)}" height="4" rx="2" fill="${t.accent}">${anim('width', D, knob.map(([at, x]) => [at, f(x - TX0)]), ease(knob.length))}</rect>`
        + `<circle cx="${f(kx0)}" cy="186" r="7.5" fill="${t.accent}" stroke="${t.raised}" stroke-width="2">${anim('cx', D, knob.map(([at, x]) => [at, f(x)]), ease(knob.length))}`
        + `${anim('r', D, [[0, 7.5], [DRAG[0] - 0.01, 7.5], [DRAG[0], 9], [DRAG[1], 9], [DRAG[1] + 0.01, 7.5], [1, 7.5]])}</circle>`
        // prompt button
        + `<rect x="20" y="${BY}" width="196" height="${BH}" rx="${BH / 2}" fill="${t.surface}" stroke="${t.line}" stroke-width="1.5"/>`
        + `<g>${anim('opacity', D, [[0, 1], [COPIED[0] - 0.005, 1], [COPIED[0], 0], [COPIED[2] - 0.005, 0], [COPIED[2] + 0.01, 1], [1, 1]])}${lbl('Copy prompt', t.text, copyIcon)}</g>`
        + `<g opacity="0">${anim('opacity', D, [[0, 0], [COPIED[0] - 0.005, 0], [COPIED[0], 1], [COPIED[1], 1], [COPIED[2], 0], [1, 0]])}`
        + `<rect x="20" y="${BY}" width="196" height="${BH}" rx="${BH / 2}" fill="${t.accent}"/>${lbl('Prompt copied', t.accentInk, checkIcon)}</g>`
        + `<circle cx="194" cy="${BY + 20}" r="8" fill="${t.text}" opacity="0">${anim('opacity', D, [[0, 0], [CLICK, 0], [CLICK + 0.01, 0.4], [CLICK + 0.07, 0], [1, 0]])}${anim('r', D, [[0, 8], [CLICK, 8], [CLICK + 0.07, 24], [1, 24]])}</circle>`
        + `<g transform="translate(${REST})"><path d="M0 0v17l4.6-4.4 3 7 3-1.3-3-6.8h6.4z" fill="#ffffff" stroke="#050806" stroke-width="1.4" stroke-linejoin="round"/>`
        + tf('translate', D, cursor, ease(cursor.length)) + '</g>',
    };
  },

  // lifelike-heroes: the star chart hero, a night over a snowy spruce forest. The pointer pencils a
  // constellation between the bright stars nearby, a click inks it in and a shooting star marks it.
  sky(t, r) {
    const D = 10, n = themes.dark, ink = '#f4a77a', star = '#f4f7f2';
    // the scene is a photograph, so it stays a night sky in both themes
    let dust = '', stars = '';
    for (let i = 0; i < 70; i++) { // the Milky Way: a haze and a band of faint stars across it
      const s = (r() - 0.5) * 300, off = (r() + r() + r() - 1.5) * 16;
      dust += `<circle cx="${f(118 + s * 0.883 + off * 0.469)}" cy="${f(92 - s * 0.469 + off * 0.883)}" r="${f(0.3 + r() * 0.45)}" opacity="${f(0.25 + r() * 0.4)}"/>`;
    }
    for (let i = 0; i < 52; i++) {
      const tw = r() < 0.4 ? ` class="tw" style="animation-duration:${f(2.6 + r() * 4)}s;animation-delay:-${f(r() * 6)}s"` : '';
      stars += `<circle cx="${f(r() * SW)}" cy="${f(r() ** 1.25 * 196)}" r="${f(0.45 + r() * 0.85)}" opacity="${f(0.3 + r() * 0.6)}"${tw}/>`;
    }

    // the constellation: a minimum spanning tree over the bright stars, the way the hero joins them
    const cs = [[40, 74], [70, 52], [98, 68], [128, 46], [158, 62], [112, 98]];
    const edges = [], inTree = [0];
    while (inTree.length < cs.length) {
      let best = null;
      for (const a of inTree) for (let b = 0; b < cs.length; b++) {
        if (inTree.includes(b)) continue;
        const d = Math.hypot(cs[a][0] - cs[b][0], cs[a][1] - cs[b][1]);
        if (!best || d < best.d) best = { a, b, d };
      }
      edges.push(best); inTree.push(best.b);
    }
    const HOVER = 0.2, CLICK = 0.31, NAMED = 0.55, FADE = [0.86, 0.93];
    const C = [102, 74]; // where the pointer hovers
    const seg = e => `M${cs[e.a][0]} ${cs[e.a][1]}L${cs[e.b][0]} ${cs[e.b][1]}`;
    let pencil = '', inked = '';
    edges.forEach((e, i) => {
      const mid = [(cs[e.a][0] + cs[e.b][0]) / 2, (cs[e.a][1] + cs[e.b][1]) / 2];
      const at = HOVER - 0.08 + Math.min(0.07, Math.hypot(mid[0] - C[0], mid[1] - C[1]) / 900);
      pencil += `<path d="${seg(e)}" opacity="0">${anim('opacity', D, [[0, 0], [at, 0], [at + 0.03, 0.6], [CLICK, 0.6], [CLICK + 0.03, 0], [1, 0]])}</path>`;
      const L = Math.ceil(e.d), s = CLICK + 0.01 + i * 0.04;
      inked += `<path d="${seg(e)}" stroke-dasharray="${L}">${anim('stroke-dashoffset', D, [[0, L], [s, L], [s + 0.045, 0], [1, 0]], ease(4))}</path>`;
    });
    const shown = [[0, 0], [CLICK, 0], [CLICK + 0.005, 1], [FADE[0], 1], [FADE[1], 0], [1, 0]];
    const bright = cs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="url(#glint)" opacity=".45">${anim('opacity', D, [[0, 0.45], [CLICK, 0.45], [CLICK + 0.06, 0.95], [FADE[0], 0.95], [FADE[1], 0.45], [1, 0.45]])}</circle>`
      + `<circle cx="${x}" cy="${y}" r="1.7" fill="${star}"/>`).join('');
    const name = text('The Penguin', { x: 112, y: 120, size: 12, weight: 500, tracking: 0.04, anchor: 'middle' });

    // aurora over the treeline, green with a violet crown
    const ribbons = [
      { yb: 200, amp: 9, h: 70, c: n.aurora[1], o: 0.85, dur: 13 },
      { yb: 176, amp: 7, h: 44, c: n.aurora[2], o: 0.6, dur: 17 },
    ];
    let aurora = '';
    ribbons.forEach((rb, i) => {
      const shapes = [0, 1.7, 3.2].map(p => auroraShape(-24, SW + 24, rb.yb, rb.amp, rb.h, p + i * 2, 5.5));
      const morph = `<animate attributeName="d" dur="${rb.dur}s" repeatCount="indefinite" values="${[...shapes, shapes[0]].join(';')}" keyTimes="0;.33;.66;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>`;
      aurora += `<g opacity="${rb.o}" fill="url(#au${i})" mask="url(#rays)"><path d="${shapes[0]}" filter="url(#soft)">${morph}</path><path d="${shapes[0]}" opacity=".45">${morph}</path></g>`;
    });

    // snowy spruce forest, a small observatory on the rise
    let far = 'M-4 222', x = -4;
    while (x < SW + 4) { const w = 4 + r() * 5, h = 5 + r() * 11; far += `L${f(x + w / 2)} ${f(214 - h)}L${f(x + w)} 214`; x += w; }
    let forest = `<path d="${far}L${f(x)} 222z" fill="#0b130f"/>`
      + `<path d="M-4 218C40 212 80 218 120 215S190 207 240 212V${SH + 4}H-4z" fill="url(#snowfield)"/>`
      + `<rect x="157" y="200" width="22" height="12" fill="#0d1511"/><path d="M156 201a12 11 0 0 1 24 0z" fill="#c9d4c6"/><path d="M165.6 191.6l3.6-.5v9.9h-3.6z" fill="#0d1511"/><rect x="161" y="204" width="3" height="3" fill="#f2c879"/>`;
    for (const [x, y, h] of [[4, 252, 46], [20, 258, 56], [40, 256, 36], [56, 260, 24], [196, 262, 30], [210, 256, 50], [228, 252, 40]]) forest += pine(x, y, h, n, r);

    // the pointer glides in, hovers, clicks, and drifts off again
    const REST = '204 132';
    const cursor = [[0, REST], [0.04, REST], [HOVER, `${C[0]} ${C[1]}`], [CLICK + 0.04, `${C[0] - 2} ${C[1] + 2}`], [0.52, REST], [1, REST]];
    const SHOT = [0.6, 0.67];

    return {
      style: '.tw{animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.12}}',
      defs: `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1">${n.sky.map((c, i) => `<stop offset="${k(i / (n.sky.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`
        + `<radialGradient id="glint"><stop stop-color="${star}" stop-opacity=".9"/><stop offset=".35" stop-color="${star}" stop-opacity=".25"/><stop offset="1" stop-color="${star}" stop-opacity="0"/></radialGradient>`
        + ribbons.map((rb, i) => `<linearGradient id="au${i}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a493e0" stop-opacity="0"/><stop offset=".45" stop-color="#a493e0" stop-opacity=".14"/><stop offset=".82" stop-color="${rb.c}" stop-opacity=".7"/><stop offset="1" stop-color="${rb.c}" stop-opacity=".15"/></linearGradient>`).join('')
        + `<linearGradient id="snowfield" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a9bcab"/><stop offset="1" stop-color="#55665a"/></linearGradient>`
        + `<linearGradient id="streak" x1="38" y1="-21" x2="0" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${star}" stop-opacity="0"/><stop offset="1" stop-color="${star}"/></linearGradient>`
        // auroral curtains fall in rays: a mask of uneven vertical stripes
        + `<linearGradient id="ray" x1="0" x2="23" gradientUnits="userSpaceOnUse" spreadMethod="repeat">${[[0, 0.5], [0.2, 1], [0.32, 0.6], [0.5, 0.85], [0.62, 0.45], [0.8, 1], [1, 0.5]].map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`).join('')}</linearGradient>`
        + `<mask id="rays" maskUnits="userSpaceOnUse" x="-30" y="0" width="${SW + 60}" height="${SH}"><rect x="-30" width="${SW + 60}" height="${SH}" fill="url(#ray)"/></mask>`
        + '<filter id="soft" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>'
        + '<filter id="haze" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>',
      body: `<rect width="${SW}" height="${SH}" fill="url(#night)"/>`
        + `<ellipse cx="118" cy="92" rx="170" ry="17" transform="rotate(-28 118 92)" fill="#cfe0d4" opacity=".1" filter="url(#haze)"/>`
        + `<g fill="${star}">${dust}${stars}</g>${aurora}`
        // the hero's own furniture: a small nav, and its headline
        + `<g fill="${star}" opacity=".5"><circle cx="20" cy="20" r="3.5"/><rect x="28" y="18" width="26" height="4" rx="2"/><rect x="152" y="18.5" width="16" height="3" rx="1.5"/><rect x="176" y="18.5" width="16" height="3" rx="1.5"/><rect x="200" y="18.5" width="18" height="3" rx="1.5"/></g>`
        + `<path d="${text('Polar Night', { x: SW / 2, y: 170, size: 24, weight: 300, tracking: 0.02, anchor: 'middle' }).d}" fill="${star}"/>`
        + forest
        // the constellation
        + `<g stroke="${star}" stroke-width=".9" stroke-dasharray="2 3">${pencil}</g>`
        + `<g stroke="${ink}" stroke-linecap="round">${anim('opacity', D, shown)}<g stroke-width="4.5" opacity=".25">${inked}</g><g stroke-width="1.6">${inked}</g></g>`
        + bright
        + `<g>${anim('opacity', D, [[0, 0], [NAMED, 0], [NAMED + 0.04, 1], [FADE[0], 1], [FADE[1], 0], [1, 0]])}<path d="${name.d}" fill="${ink}"/></g>`
        // a shooting star marks the moment
        + `<g opacity="0">${anim('opacity', D, [[0, 0], [SHOT[0], 0], [SHOT[0] + 0.015, 1], [SHOT[1] - 0.02, 1], [SHOT[1], 0], [1, 0]])}<g transform="translate(232 22)">`
        + tf('translate', D, [[0, '232 22'], [SHOT[0], '232 22'], [SHOT[1], '178 52'], [1, '178 52']], ` calcMode="spline" keySplines="0 0 1 1;.3 .6 .5 1;0 0 1 1"`)
        + `<path d="M38-21L0 0" stroke="url(#streak)" stroke-width="1.4" stroke-linecap="round"/><circle r="1.4" fill="${star}"/></g></g>`
        // a click ring and the pointer
        + `<circle cx="${C[0]}" cy="${C[1]}" r="4" stroke="${star}" stroke-width="1.5" opacity="0">${anim('opacity', D, [[0, 0], [CLICK, 0], [CLICK + 0.01, 0.8], [CLICK + 0.08, 0], [1, 0]])}${anim('r', D, [[0, 4], [CLICK, 4], [CLICK + 0.08, 20], [1, 20]])}</circle>`
        + `<g transform="translate(${C[0]} ${C[1]})"><path d="M0 0v17l4.6-4.4 3 7 3-1.3-3-6.8h6.4z" fill="#ffffff" stroke="#050806" stroke-width="1.4" stroke-linejoin="round"/>`
        + tf('translate', D, cursor, ease(cursor.length)) + '</g>',
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
  // long repo names shrink to keep clear of the arrow
  const nameSize = Math.min(34, f(34 * 250 / text(p.repo, { size: 34, weight: 500, tracking: -0.01 }).width));
  const name = text(p.repo, { x: TX, y: 66, size: nameSize, weight: 500, tracking: -0.01 });
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
