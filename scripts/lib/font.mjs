// Text → SVG path data, using vendored Outfit outlines (scripts/fonts, OFL).
// Images on GitHub can't load web fonts reliably, so every word is drawn as a path.
import fs from 'node:fs';

const fonts = new Map();

export function font(weight = 400) {
  if (!fonts.has(weight)) {
    const url = new URL(`../fonts/outfit-${weight}.json`, import.meta.url);
    fonts.set(weight, JSON.parse(fs.readFileSync(url, 'utf8')));
  }
  return fonts.get(weight);
}

// Compact relative path data. Coordinates are snapped to tenths first, so the
// relative steps add up exactly and nothing drifts along a contour.
function place(d, s, ox, oy) {
  let out = '', cmd = '', axis = 0, start = [0, 0], cur = [0, 0], pair = [], args = [];
  const flush = () => {
    if (!cmd) return;
    if (cmd === 'Z') { out += 'z'; cur = start.slice(); return; }
    // The first moveto stays absolute, so glyph paths can be concatenated.
    const first = !out;
    const rel = first ? args : args.map((v, i) => v - cur[i % 2]);
    out += (first ? 'M' : cmd.toLowerCase()) + rel.map((v, i) => (i && v >= 0 ? ' ' : '') + String(v / 10).replace(/^(-?)0\./, '$1.')).join('');
    cur = args.slice(-2);
    if (cmd === 'M') start = cur.slice();
  };
  for (const tok of d.match(/[MLQCZ]|-?\d*\.?\d+/g) ?? []) {
    if ('MLQCZ'.includes(tok)) { flush(); cmd = tok; args = []; axis = 0; if (tok === 'Z') { flush(); cmd = ''; } continue; }
    args.push(Math.round((axis ? oy + tok * s : ox + tok * s) * 10));
    axis ^= 1;
  }
  flush();
  return out;
}

// Advance positions for one line. tracking is in em.
export function layout(str, { size = 16, weight = 400, tracking = 0 } = {}) {
  const f = font(weight);
  const s = size / f.unitsPerEm;
  const chars = [...str];
  const glyphs = [];
  let x = 0;
  chars.forEach((ch, i) => {
    const g = f.glyphs[ch] ?? f.glyphs['?'];
    glyphs.push({ ch, x, w: g.a * s, g });
    x += g.a * s;
    if (i < chars.length - 1) x += tracking * size + (f.kern[ch + chars[i + 1]] ?? 0) * s;
  });
  return { glyphs, width: x, scale: s };
}

export const measure = (str, opts) => layout(str, opts).width;

const startX = (x, width, anchor) => x - (anchor === 'middle' ? width / 2 : anchor === 'end' ? width : 0);

// One line of text as a single path. anchor: start | middle | end.
export function text(str, { x = 0, y = 0, size = 16, weight = 400, tracking = 0, anchor = 'start' } = {}) {
  const L = layout(str, { size, weight, tracking });
  const x0 = startX(x, L.width, anchor);
  const glyphs = L.glyphs.map(gl => ({ ch: gl.ch, x: x0 + gl.x, w: gl.w, d: gl.g.d ? place(gl.g.d, L.scale, x0 + gl.x, y) : '' }));
  return { d: glyphs.map(g => g.d).join(''), width: L.width, x0, glyphs };
}

// For text that repeats letters (typed lines, labels): each glyph is defined
// once per size/weight and placed with <use>.
export function glyphSet(prefix = 'g') {
  const defs = new Map();
  return {
    run(str, { x = 0, y = 0, size = 16, weight = 400, tracking = 0, anchor = 'start' } = {}) {
      const L = layout(str, { size, weight, tracking });
      const x0 = startX(x, L.width, anchor);
      const glyphs = L.glyphs.map(gl => {
        const id = `${prefix}${weight}-${String(size).replace('.', '_')}-${gl.ch.codePointAt(0)}`;
        if (gl.g.d && !defs.has(id)) defs.set(id, place(gl.g.d, L.scale, 0, 0));
        return { ch: gl.ch, x: x0 + gl.x, w: gl.w, use: gl.g.d ? `<use href="#${id}" x="${+(x0 + gl.x).toFixed(1)}" y="${+y.toFixed(1)}"/>` : '' };
      });
      return { svg: glyphs.map(g => g.use).join(''), width: L.width, x0, glyphs };
    },
    defs: () => [...defs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
}

// Greedy word wrap into lines no wider than maxWidth.
export function wrap(str, maxWidth, opts) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, opts) > maxWidth) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
