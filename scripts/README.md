# Profile images

Every image in `assets/` is drawn by these scripts. Nothing to install: plain Node 18+.

```sh
node scripts/build.mjs              # everything except the snow report
node scripts/build.mjs cards hero   # just some: hero, hello, headings, toolkit, cards, beyond, pills, snow
node scripts/build.mjs snow --mock  # preview the snow report with made-up data (writes .preview/)
```

- **Change the words:** edit `content.mjs` (hero lines, headings, toolkit, project cards,
  signpost) and push. The *Profile images* workflow redraws and commits the SVGs.
- **Snow report:** the workflow redraws it once a day from the GitHub API with its own
  `GITHUB_TOKEN`. It only commits when the picture changes.
- **Colours:** `lib/theme.mjs` holds the tokens from the portfolio's design system.
- **Text** is drawn as paths from vendored Outfit outlines (`fonts/`, SIL OFL 1.1),
  because images on GitHub can't load web fonts.
- **Icons** in `data/icons.json` come from [Simple Icons](https://simpleicons.org) (CC0).
- **Character frames** in `sprites/` come from the portfolio's sprite atlas.

Every animation respects `prefers-reduced-motion`.
