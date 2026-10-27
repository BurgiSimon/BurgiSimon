import fs from 'node:fs';
import path from 'node:path';

export const f = v => +(+v).toFixed(1);   // geometry, durations
export const k = v => +(+v).toFixed(4);   // keyTimes and other fractions
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Deterministic randomness, so regenerating an unchanged image gives identical bytes.
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + next() * (hi - lo);
  next.pick = list => list[Math.floor(next() * list.length)];
  return next;
}

// Every image honours reduced motion: CSS animations stop, and anything driven
// by SMIL is swapped for its static twin via the .motion / .still classes.
const REDUCED = '.still{display:none}@media (prefers-reduced-motion:reduce){*{animation:none!important}.motion{display:none}.still{display:inline}}';

export function doc({ width, height, title, desc, style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">`
    + `<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>`
    + `<style>${style}${REDUCED}</style>`
    + (defs ? `<defs>${defs}</defs>` : '')
    + body + '</svg>\n';
}

const root = new URL('../../', import.meta.url);

export function write(rel, content) {
  const file = new URL(rel, root);
  fs.mkdirSync(path.dirname(file.pathname), { recursive: true });
  const changed = !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content;
  if (changed) fs.writeFileSync(file, content);
  console.log(`${changed ? 'wrote ' : 'same  '} ${rel}  ${(Buffer.byteLength(content) / 1024).toFixed(1)} kB`);
}

export const read = rel => fs.readFileSync(new URL(rel, root));
