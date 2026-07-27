# Badminton Squad Tracker — Implementation Brief

> Hand this document to any LLM or developer to implement the full project from scratch.
> GitHub repo: https://github.com/mavinash-dev/badminton-squad

---

## What We're Building

A web app for a group of 3–4 friends who play badminton weekly. It:

- Lets the group select who's playing today (3 or 4 players) and how long (1h or 2h)
- Calls the **Grok API** to generate a fair, rotated match schedule
- Lets players log match winners (no granular scoring — just who won)
- Calculates and displays an **all-time leaderboard**: Best Single Player + Best Duo
- Generates a **fun AI post-match summary** via Grok at the end of each session
- Stores all history in **`history.json`** committed to the GitHub repo — shared source of truth for all players

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + Vite | Fast dev, clean component model, standard GitHub Pages deploy |
| Styling | Tailwind CSS + custom CSS animations | Utility-first + full control for badminton-themed animations |
| GitHub storage | `@octokit/rest` | Read/write `history.json` via GitHub Contents API |
| AI | Grok API (`api.x.ai`) | Schedule generation + post-match commentary |
| Deploy | `gh-pages` npm package | `npm run deploy` → pushes `dist/` to `gh-pages` branch |
| Secrets | GitHub Actions secrets → Vite env vars | Keys baked into bundle at build time. Zero localStorage. Zero user config. |

---

## Secrets Architecture (Important)

**No localStorage. No user configuration required.**

The GitHub PAT and Grok API key are stored as **GitHub Actions secrets** (`GH_PAT`, `GROK_API_KEY`). The GitHub Actions deploy workflow passes them as `VITE_GH_PAT` and `VITE_GROK_API_KEY` to Vite, which embeds them in the compiled JS bundle at build time. All 4 players open the same GitHub Pages URL and it works with no setup.

For **local development**, create a `.env.local` file (gitignored) with the same vars.

**One-time setup by repo owner:**
1. GitHub repo → Settings → Secrets and variables → Actions
2. Add `GH_PAT` — a Personal Access Token with `contents:write` scope on this repo
3. Add `GROK_API_KEY` — key from [api.x.ai](https://api.x.ai)

---

## File Structure

```
badminton-squad/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← builds + deploys to gh-pages, injects secrets as VITE_ vars
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← view state machine: setup → schedule → logging → results → leaderboard
│   ├── index.css               ← global styles, CSS custom properties, animation keyframes
│   ├── components/
│   │   ├── Setup.jsx           ← player name inputs + duration picker
│   │   ├── Schedule.jsx        ← AI-generated match cards with badminton net decoration
│   │   ├── MatchLogger.jsx     ← per-match winner modal
│   │   ├── Results.jsx         ← session recap + AI summary + save button
│   │   ├── Leaderboard.jsx     ← all-time stats, best duo, MVP highlight
│   │   └── Animations.jsx      ← shuttle, racket, confetti SVG/CSS components
│   └── lib/
│       ├── github.js           ← readHistory() + writeHistory() via Octokit
│       ├── grok.js             ← generateSchedule() + generateSummary()
│       └── tournament.js       ← pure logic: rotations, win-rate calc, tie-breaking
├── public/
│   └── history.json            ← seed file (used only for local dev fallback)
├── history.json                ← THE live database (in repo root, updated by GitHub API)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## JSON Schema (`history.json`)

```json
{
  "players": [
    { "id": "p1", "name": "Player 1", "wins": 0, "games": 0 },
    { "id": "p2", "name": "Player 2", "wins": 0, "games": 0 },
    { "id": "p3", "name": "Player 3", "wins": 0, "games": 0 },
    { "id": "p4", "name": "Player 4", "wins": 0, "games": 0 }
  ],
  "duos": {
    "p1_p2": { "wins": 0, "games": 0 },
    "p1_p3": { "wins": 0, "games": 0 },
    "p1_p4": { "wins": 0, "games": 0 },
    "p2_p3": { "wins": 0, "games": 0 },
    "p2_p4": { "wins": 0, "games": 0 },
    "p3_p4": { "wins": 0, "games": 0 }
  },
  "sessions": [
    {
      "id": "s_20260727_001",
      "date": "2026-07-27",
      "duration": 2,
      "playerCount": 4,
      "matches": [
        {
          "matchId": 1,
          "teamA": ["p1", "p2"],
          "teamB": ["p3", "p4"],
          "format": "first to 21",
          "winner": "A"
        }
      ],
      "sessionLeaderboard": {
        "mvp": "p1",
        "bestDuo": "p1_p2"
      },
      "aiSummary": "..."
    }
  ]
}
```

**Duo key convention:** always sort player IDs alphabetically — `p1_p3` never `p3_p1`. Enforced in `tournament.js`.

---

## Tournament Formats & Rotation Logic

All rotation logic lives in `src/lib/tournament.js` as pure functions (no React, easy to test).

### 4 Players — 2v2 Rotating

Everyone plays with everyone once. Three fixed matchups:
- Match 1: `[p1, p2]` vs `[p3, p4]`
- Match 2: `[p1, p3]` vs `[p2, p4]`
- Match 3: `[p1, p4]` vs `[p2, p3]`

| Duration | Format |
|---|---|
| 1 hour | 3 games, first to 21. ~45 min total. |
| 2 hours | Best-of-3 sets per matchup. Up to 9 games. ~1.5–2h. |

### 3 Players — 1v2 Handicap Rotation

Each player gets a solo turn against the other two:
- Match 1: `[p1]` vs `[p2, p3]`
- Match 2: `[p2]` vs `[p1, p3]`
- Match 3: `[p3]` vs `[p1, p2]`

| Duration | Format |
|---|---|
| 1 hour | 2 full rotations (6 games to 15). |
| 2 hours | 4 full rotations (12 games to 15 or 21). |

### Tie-Breaking

1. Higher total game wins
2. If still tied: call Grok with `"declare a winner based on vibes"` — fun, not serious

---

## Grok API Integration (`src/lib/grok.js`)

```js
const GROK_BASE = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4';

export async function generateSchedule({ players, hours }) {
  const n = players.length;
  const format = n === 4 ? '2v2 rotating partners' : '1v2 handicap rotation';
  const res = await fetch(GROK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a badminton tournament scheduler. Return ONLY valid JSON, no markdown.',
        },
        {
          role: 'user',
          content: `Schedule a ${hours}-hour badminton session for ${n} players: ${players.map(p => p.name).join(', ')}.
Format: ${format}. Include match number, teamA (array of player names), teamB, and game format (e.g. "first to 21").
Return: { "matches": [ { "id": 1, "teamA": [...], "teamB": [...], "format": "..." } ] }`,
        },
      ],
    }),
  });
  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

export async function generateSummary({ players, matches, sessionLeaderboard }) {
  const res = await fetch(GROK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an energetic sports commentator for a friends badminton group. Be hype, casual, fun. 3 sentences max. No markdown.',
        },
        {
          role: 'user',
          content: `Match results: ${JSON.stringify(matches)}. Players: ${JSON.stringify(players)}.
MVP: ${sessionLeaderboard.mvp}. Best duo: ${sessionLeaderboard.bestDuo}.
Write a short, hype tournament wrap-up declaring the champion and roasting the losers gently.`,
        },
      ],
    }),
  });
  const json = await res.json();
  return json.choices[0].message.content;
}
```

---

## GitHub API Integration (`src/lib/github.js`)

```js
import { Octokit } from '@octokit/rest';

const OWNER = 'mavinash-dev';
const REPO = 'badminton-squad';
const PATH = 'history.json';

const octokit = new Octokit({ auth: import.meta.env.VITE_GH_PAT });

export async function readHistory() {
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
  return {
    data: JSON.parse(atob(data.content)),
    sha: data.sha,
  };
}

export async function writeHistory(newData, sha, sessionDate) {
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: PATH,
    message: `session: ${sessionDate}`,
    content: btoa(JSON.stringify(newData, null, 2)),
    sha,
  });
}
```

**Important:** `writeHistory` requires the current file's `sha` (from `readHistory`) to prevent overwrites. Always fetch fresh before writing.

---

## App Views (`src/App.jsx`)

State machine with 5 views — no router needed, just a `currentView` string:

```
setup → schedule → logging → results → leaderboard
                     ↑           |
                     └───────────┘ (log more matches)
```

| View | Component | What it does |
|---|---|---|
| `setup` | `Setup.jsx` | Choose players (3 or 4), set duration, hit "Generate Schedule" |
| `schedule` | `Schedule.jsx` | Shows AI match list with net decoration. Each card has "Log Winner" |
| `logging` | `MatchLogger.jsx` | Modal: two team buttons, tap to record winner, back to schedule |
| `results` | `Results.jsx` | Session recap. "Generate AI Summary" → Grok. "Save Session" → GitHub |
| `leaderboard` | `Leaderboard.jsx` | All-time stats. MVP gold shimmer. Accessible from any view via nav. |

---

## Design Language

Inspired by a dark dashboard aesthetic — **not** a copy of any specific company brand. Original for this project.

### Color Tokens (define as CSS custom properties in `index.css`)

```css
:root {
  --canvas:   #080f11;   /* page background */
  --surface:  #0e1518;   /* card background */
  --elevated: #141c20;   /* hover state */
  --border:   #1f272b;   /* default border */
  --border-hi:#2a343a;   /* hover/active border */
  --fg:       #fdfcf0;   /* primary text */
  --fg-body:  #f1f0e4;   /* body copy */
  --fg-muted: #888c8d;   /* secondary/metadata text */
  --green:    #1ce783;   /* primary accent — badges, links, active states */
  --green-bg: rgba(28,231,131,.10); /* subtle green tint */
  --court:    #2a4a3a;   /* badminton court green — used in net/court decorations */
}
```

### Typography

- **Inter** — body, headings, buttons, cards
- **JetBrains Mono** — eyebrow labels, dates, tags, badges, monospace data

### Key UI Patterns

**Top band:** `height: 5px; background: var(--green); width: 100%` — first element on page.

**Dot-grid background:**
```css
body {
  background-image: radial-gradient(circle at 1px 1px, rgba(253,252,240,.055) 1px, transparent 0);
  background-size: 24px 24px;
}
```

**Cards:**
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px 28px;
  transition: border-color .15s, background .15s, transform .15s;
}
.card:hover {
  border-color: var(--border-hi);
  background: var(--elevated);
  transform: translateY(-1px);
}
```

**Section eyebrow labels** (JetBrains Mono, uppercase, 10px, with trailing 1px rule):
```css
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--fg-muted);
  display: flex;
  align-items: center;
  gap: 14px;
}
.eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--border); }
```

---

## Required Animations

These are non-negotiable — they make the app feel alive and fun.

### 1. Shuttlecock flying (`Animations.jsx`)
SVG shuttlecock that arcs across the screen on page load and during view transitions. Use a CSS `@keyframes` parabolic arc (`translateX` + `translateY` cubic-bezier). Disappears off-screen, does not loop intrusively.

### 2. Racket swing
SVG racket that swings (rotate from handle) on primary button clicks (Generate Schedule, Save Session). 300ms ease-out swing, then returns.

### 3. Badminton net decoration (`Schedule.jsx`)
Decorative net SVG as a section divider between the match schedule header and the match cards. Uses `--court` color + thin white mesh lines. Purely decorative, `aria-hidden`.

### 4. Winner celebration (on match result)
When a winner is logged in `MatchLogger.jsx`:
- Winning team card gets a green glow pulse: `box-shadow: 0 0 0 2px var(--green)`
- Confetti burst: 20–30 small colored divs with random `translateY` + `rotate` keyframes, auto-removed after 1.5s
- "Winner!" badge appears with a scale-in animation

### 5. MVP gold shimmer (`Leaderboard.jsx`)
The #1 ranked player's card gets a subtle gold shimmer sweep (`linear-gradient` moving across with `@keyframes shimmer`). Uses `overflow: hidden` + pseudo-element technique.

### 6. Radar pulse dot
```css
.dot-live::after {
  content: '';
  position: absolute; inset: 0; border-radius: 50%;
  background: var(--green);
  animation: radar 1.6s ease-out infinite;
}
@keyframes radar {
  0%  { transform: scale(1); opacity: .55; }
  80% { opacity: 0; }
  100%{ transform: scale(3.5); opacity: 0; }
}
```

### 7. Card fade-in on load
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeUp .35s ease both; }
/* Stagger with inline style: animation-delay: calc(var(--i) * 80ms) */
```

---

## GitHub Actions Deploy Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_GH_PAT: ${{ secrets.GH_PAT }}
          VITE_GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/badminton-squad/',
})
```

---

## Local Development

```bash
git clone https://github.com/mavinash-dev/badminton-squad.git
cd badminton-squad
npm install
```

Create `.env.local` (gitignored):
```
VITE_GH_PAT=your_pat_here
VITE_GROK_API_KEY=your_grok_key_here
```

```bash
npm run dev
# Opens at http://localhost:5173/badminton-squad/
```

---

## Implementation Order (for LLMs)

1. Scaffold Vite + React project, install deps (`@octokit/rest`, `tailwindcss`, `gh-pages`)
2. Set up `index.css` with all color tokens and global animation keyframes
3. Implement `src/lib/tournament.js` — pure rotation and stats logic, no React
4. Implement `src/lib/github.js` — `readHistory` + `writeHistory`
5. Implement `src/lib/grok.js` — `generateSchedule` + `generateSummary`
6. Build `App.jsx` view state machine
7. Build each view component in order: `Setup` → `Schedule` → `MatchLogger` → `Results` → `Leaderboard`
8. Build `Animations.jsx` — shuttle, racket, confetti, net SVGs
9. Wire animations into each view (see Required Animations section above)
10. Create `history.json` seed file in repo root with 4 placeholder player names
11. Create `.github/workflows/deploy.yml`
12. Test locally, push, verify GitHub Pages deployment

---

## Dependencies

```
react, react-dom
vite, @vitejs/plugin-react
tailwindcss, autoprefixer, postcss
@octokit/rest
gh-pages
```

No other third-party UI or animation libraries. All animations are hand-written CSS/SVG.

---

*Generated 2026-07-27 — Badminton Squad project briefing*
