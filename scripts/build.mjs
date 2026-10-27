// Builds every image in assets/. `node scripts/build.mjs [name ...]` builds a subset.
// The snow report needs GITHUB_TOKEN (the workflow provides it); `--mock` previews it
// with made-up data into .preview/ instead, so fake numbers never reach the profile.
import fs from 'node:fs';
import * as content from './content.mjs';
import { themes } from './lib/theme.mjs';
import { write } from './lib/svg.mjs';
import { fetchCalendar, mockCalendar, stats } from './lib/contributions.mjs';
import { hero } from './gen/hero.mjs';
import { heading } from './gen/heading.mjs';
import { chairlift } from './gen/chairlift.mjs';
import { card } from './gen/card.mjs';
import { hello } from './gen/hello.mjs';
import { beyond } from './gen/beyond.mjs';
import { snowReport, snowPlaceholder } from './gen/snow-report.mjs';
import { pill } from './gen/pill.mjs';

const repo = rel => new URL(`../${rel}`, import.meta.url);
const args = process.argv.slice(2);
const mock = args.includes('--mock');
const only = args.filter(a => !a.startsWith('--'));
const want = name => !only.length || only.includes(name);

if (want('hero')) write('assets/hero.svg', hero(content.hero, themes.dark));
if (want('hello')) write('assets/hello.svg', hello(themes.dark));

for (const t of Object.values(themes)) {
  if (want('headings')) {
    Object.entries(content.headings).forEach(([key, h], i) => write(`assets/heading-${key}-${t.name}.svg`, heading(h, i + 1, t)));
  }
  if (want('toolkit')) write(`assets/toolkit-${t.name}.svg`, chairlift(content.toolkit, t));
  if (want('cards')) for (const p of content.projects) write(`assets/card-${p.repo.toLowerCase()}-${t.name}.svg`, card(p, t));
  if (want('beyond')) write(`assets/beyond-${t.name}.svg`, beyond(content.beyond, t));
  if (want('pills')) content.links.forEach((l, i) => write(`assets/pill-${l.id}-${t.name}.svg`, pill(l, t, i * 0.6)));
}

if (want('snow')) {
  const token = process.env.GITHUB_TOKEN;
  const today = new Date().toISOString().slice(0, 10);
  let cal = null;
  if (mock) cal = mockCalendar();
  else if (token) {
    try { cal = await fetchCalendar(content.user, token); }
    catch (err) {
      // Keep yesterday's report rather than failing the whole build (the other images still update).
      console.log(`::warning::snow report not updated: ${err.message}`);
    }
  }
  if (cal) {
    const s = stats(cal);
    for (const t of Object.values(themes)) {
      const rel = `${mock ? '.preview' : 'assets'}/snow-report-${t.name}.svg`;
      // Keep the previous date unless the picture itself changed: "Updated" then means
      // fresh snow, and quiet days produce no commit.
      const prev = fs.existsSync(repo(rel)) ? fs.readFileSync(repo(rel), 'utf8') : '';
      const prevDate = prev.match(/<!-- updated:(\d{4}-\d{2}-\d{2}) -->/)?.[1];
      const render = date => snowReport(cal, s, t, date).replace('</svg>', `<!-- updated:${date} --></svg>`);
      if (prevDate && render(prevDate) === prev) { console.log(`same   ${rel}  (no new contributions)`); continue; }
      write(rel, render(today));
    }
  } else {
    for (const t of Object.values(themes)) {
      const rel = `assets/snow-report-${t.name}.svg`;
      if (!fs.existsSync(repo(rel))) write(rel, snowPlaceholder(t));
    }
    if (!token) console.log('snow report: no GITHUB_TOKEN, kept the current images (use --mock for a preview)');
  }
}
