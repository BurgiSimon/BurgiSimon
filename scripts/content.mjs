// Everything the images say. Edit here, then run `node scripts/build.mjs`
// (or just push: the profile workflow rebuilds and commits the SVGs).

export const user = 'BurgiSimon';

export const hero = {
  greeting: 'Hoi, I’m',
  name: 'Simon',
  tagline: 'Developer. Tinkerer. Mountain person.',
  typing: [
    'building a Dynamic Island for Spotify',
    'modding Minecraft with Fabric',
    'teaching AI agents good design',
    'crafting websites in Three.js & GSAP',
    'probably on the slopes right now',
  ],
};

// Pills under the hero. icon = simple-icons slug from scripts/data/icons.json.
export const links = [
  { id: 'work', label: 'Work · @ktsobus', icon: 'github', href: 'https://github.com/ktsobus' },
  { id: 'modrinth', label: 'PlayerScale on Modrinth', icon: 'modrinth', href: 'https://modrinth.com/mod/playerscale' },
  { id: 'kofi', label: 'Support me on Ko-fi', icon: 'kofi', href: 'https://ko-fi.com/chliburgi' },
];

// Section titles; the last word is set in the accent colour, like on the portfolio.
export const headings = {
  about: { label: 'About', title: ['A practical mind.', 'An exploring', 'spirit.'] },
  toolkit: { label: 'Toolkit', title: ['Things I like', 'working', 'with.'] },
  work: { label: 'Work', title: ['Built out of', '', 'curiosity.'] },
  stats: { label: 'Snow report', title: ['A year of', 'fresh', 'tracks.'] },
  beyond: { label: 'Beyond', title: ['There’s a world beyond the', '', 'screen.'] },
};

// Riders on the chairlift. icon = simple-icons slug, or a built-in glyph (chip, sparkles).
export const toolkit = [
  { name: 'React', icon: 'react' },
  { name: 'Vue', icon: 'vuedotjs' },
  { name: 'Next.js', icon: 'nextdotjs' },
  { name: 'Astro', icon: 'astro' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Java', icon: 'cup' },
  { name: 'Groovy', icon: 'apachegroovy' },
  { name: 'Spring Boot', icon: 'springboot' },
  { name: 'Python', icon: 'python' },
  { name: 'Three.js', icon: 'threedotjs' },
  { name: 'GSAP', icon: 'gsap' },
  { name: 'Vite', icon: 'vite' },
  { name: 'Bun', icon: 'bun' },
  { name: 'Docker', icon: 'docker' },
  { name: 'Linux', icon: 'linux' },
  { name: 'Electronics', icon: 'chip' },
  { name: 'Claude', icon: 'claude' },
];

// Project cards. scene = which little animation the card plays.
export const projects = [
  {
    repo: 'triolFM', scene: 'island',
    tagline: 'A little island for your music.',
    description: 'A Dynamic Island for Spotify on Linux: it peeks on track change and springs open into controls.',
    stack: ['Python', 'PySide6', 'Spotify API'],
  },
  {
    repo: 'PlayerScale', scene: 'scale',
    tagline: 'A different perspective on Minecraft.',
    description: 'A client-side Fabric mod that resizes player models from 0.1× to 10×, visible only to you.',
    stack: ['Java', 'Fabric', 'Minecraft 1.21'],
  },
  {
    repo: 'UXL', scene: 'law',
    tagline: 'The 30 Laws of UX, applied by your AI coding agent.',
    description: 'An agent skill that designs, builds and audits UI, citing the law behind every decision.',
    stack: ['Agent skill', 'Python'],
  },
  {
    repo: 'awards', scene: 'laurel',
    tagline: 'Websites in the league of award winners.',
    description: 'A Claude Code and Codex plugin: 95 recipes from award sites, a craft audit and a jury.',
    stack: ['Plugin', 'JavaScript', 'Codex'],
  },
  {
    repo: 'spoter', scene: 'swipe',
    tagline: 'Spotify × Tinder.',
    description: 'Swipe, duel and rank songs until the algorithm knows your taste better than you do.',
    stack: ['Next.js', 'TypeScript', 'Postgres'],
  },
  {
    repo: 'Shred360', scene: 'spin',
    tagline: 'Your real ski wardrobe, in 3D.',
    description: 'Build outfits from the gear you own on a 3D rider and share your fit as a 360° video.',
    stack: ['React Three Fiber', 'TypeScript'],
  },
];

// The trail signpost in "Beyond": destinations and the walking time a Swiss sign would give.
export const beyond = [
  { name: 'Skiing & hiking', time: '8 h' },
  { name: 'Football', time: '90 min' },
  { name: 'Music & trumpet', time: '1 h' },
  { name: 'Time with friends', time: '∞' },
];
