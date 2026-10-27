// Contribution calendar: fetched from the GitHub GraphQL API (the workflow's GITHUB_TOKEN
// is enough for public data), plus the numbers the snow report shows.

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

export async function fetchCalendar(login, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': `${login}-profile-readme` },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API ${res.status}: ${JSON.stringify(json.errors ?? json)}`);
  const cal = json.data.user.contributionsCollection.contributionCalendar;
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map(w => w.contributionDays.map(d => ({ date: d.date, count: d.contributionCount }))),
  };
}

// For local previews only: a plausible year, never written to the published images.
export function mockCalendar(seed = 3, today = new Date()) {
  let a = seed;
  const rand = () => ((a = (a * 1103515245 + 12345) % 2147483648) / 2147483648);
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
  const weeks = [];
  let total = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 0) weeks.push([]);
    const season = 0.5 + 0.5 * Math.sin(d.getTime() / 86400000 / 58);
    const count = rand() < 0.35 + season * 0.4 ? Math.floor(rand() ** 2 * 14 * (0.4 + season)) : 0;
    total += count;
    weeks.at(-1).push({ date: d.toISOString().slice(0, 10), count });
  }
  return { total, weeks };
}

export function stats({ total, weeks }) {
  const days = weeks.flat();
  let longest = 0, run = 0;
  for (const d of days) { run = d.count ? run + 1 : 0; longest = Math.max(longest, run); }
  // the current streak survives a still-empty today
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].count === 0) i--;
  while (i >= 0 && days[i].count > 0) { current++; i--; }
  const best = days.reduce((b, d) => (d.count > b.count ? d : b), { count: 0, date: null });
  const sums = weeks.map(w => w.reduce((s, d) => s + d.count, 0));
  const peak = sums.indexOf(Math.max(...sums));
  return { total, current, longest, best, sums, peak, activeDays: days.filter(d => d.count).length };
}
