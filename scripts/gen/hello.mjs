// About: Simon waves hello (wave, big wave, thumbs-up), with a "Hoi!" bubble.
// Transparent, so one file serves light and dark.
import { text } from '../lib/font.mjs';
import { doc, f, k } from '../lib/svg.mjs';
import { sprite } from '../lib/scene.mjs';

const W = 260, H = 300, S = 1.32;

export function hello(t) {
  const D = 6.4;
  // [frame, from, to] as loop fractions
  const plan = [['wave', 0, 0.1], ['high', 0.1, 0.18], ['wave', 0.18, 0.26], ['high', 0.26, 0.34], ['wave', 0.34, 0.56], ['thumbs', 0.56, 0.84], ['wave', 0.84, 1]];
  const frames = { wave: 'casual-wave', high: 'casual-wave-high', thumbs: 'casual-thumbs' };
  const uses = Object.keys(frames).map(name => {
    const on = plan.map(([n]) => (n === name ? 1 : 0));
    return `<use href="#${name}" opacity="${on[0]}"><animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${plan.map(p => k(p[1])).join(';')}" values="${on.join(';')}"/></use>`;
  }).join('');

  const hoi = text('Hoi!', { x: 0, y: 0, size: 26, weight: 500, anchor: 'middle' });
  const bubble = `<g transform="translate(196 52)"><g class="pop">`
    + `<path d="M-42-24h84a16 16 0 0 1 16 16v20a16 16 0 0 1-16 16H-14l-16 15 3-15h-15a16 16 0 0 1-16-16V-8a16 16 0 0 1 16-16z" fill="${t.accent}"/>`
    + `<path transform="translate(0 11)" d="${hoi.d}" fill="${t.accentInk}"/></g></g>`;

  return doc({
    width: W, height: H,
    title: 'Simon waves hello',
    desc: 'Pixel-style Simon in a burgundy hoodie and beanie waves, waves bigger, then gives a thumbs-up. A speech bubble says: Hoi!',
    style: `.pop{transform-box:fill-box;transform-origin:0% 100%;animation:pop ${D}s infinite}`
      + '@keyframes pop{0%,2%{transform:scale(0);opacity:0}7%{transform:scale(1.08);opacity:1}10%,46%{transform:scale(1);opacity:1}52%,100%{transform:scale(.6);opacity:0}}'
      + '.bob{animation:bob 3.2s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(-3px)}}',
    defs: sprite('wave', frames.wave, S) + sprite('high', frames.high, S) + sprite('thumbs', frames.thumbs, S),
    body: `<ellipse cx="${W / 2 - 18}" cy="284" rx="62" ry="9" fill="#7f8b7f" opacity=".22"/>`
      + `<g transform="translate(${W / 2 - 18} 284)"><g class="bob"><g class="motion">${uses}</g><use class="still" href="#wave"/></g></g>`
      + bubble,
  });
}
