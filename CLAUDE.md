# Badminton Squad Tracker — Project Brief for Claude

> Read this first. Every session. This is your full context.

---

## What This Project Is

**One-liner:** A zero-setup, phone-friendly badminton session tracker for a fixed friend group — AI schedules, match logging, all-time leaderboard, no accounts required.

**Problem:** A group of 3–4 friends plays badminton weekly with no fair rotation system, no shared win history, and no post-session recap. They manually juggle who plays whom and forget results.

**Solution:** A React + Vite static web app deployed to GitHub Pages. Friends open one shared URL. The app generates a fair AI-powered match schedule, lets them log winners during play, generates an AI post-match summary, and saves everything to `history.json` committed directly to the GitHub repo. The leaderboard shows all-time win rates for individuals and duo pairs.

**Positioning:** Zero server, zero accounts, zero friction. The GitHub repo is the database. Works on any phone with no app install.

---

## Target Users

- **Primary:** A group of 3–4 friends (Avinash + 3 others) who play badminton weekly
- **Not targeting:** Clubs, organizations, anyone with more than 4 players, or users needing granular score tracking

---

## Current Phase & Status

**Phase:** Phase 1
**Status:** Active — implementation in progress
**Last worked on:** 2026-07-27

**What's done:**
- [x] Full product spec in `BADMINTON_TRACKER_PROJECT.md` (in the repo root)
- [x] Project foundation docs (PRD, ARCH, DESIGN, STATUS, CLAUDE.md, README)

**What's next:**
- [ ] Scaffold Vite + React project
- [ ] Implement lib files (tournament.js, github.js, grok.js)
- [ ] Build all 5 view components
- [ ] Build Animations.jsx
- [ ] Wire up GitHub Actions deploy workflow
- [ ] Test locally and push

---

## Core Features (Phase 1)

1. **Session Setup** — Pick 3 or 4 players, set duration (1h or 2h), hit "Generate Schedule"
2. **AI Schedule** — Grok generates fair rotated match cards (2v2 or 1v2 handicap)
3. **Match Logging** — Tap each match card → log winner → confetti celebration
4. **Results + AI Summary** — Session recap, Grok-generated post-match commentary, save to GitHub
5. **All-Time Leaderboard** — Win rates for players and duo pairs across all sessions

---

## Tech Stack

- **Frontend:** React + Vite (static, no SSR)
- **Styling:** Tailwind CSS + custom CSS animations (no animation libraries)
- **Storage:** `history.json` in GitHub repo root, read/written via `@octokit/rest`
- **AI:** Grok API (`api.x.ai`, model: `grok-4`)
- **Deploy:** `gh-pages` npm package + GitHub Actions on push to main
- **Secrets:** GitHub Actions secrets → `VITE_GH_PAT` + `VITE_GROK_API_KEY` baked into bundle

---

## File Structure (target state)

```
badminton-squad/              ← GitHub repo: mavinash-dev/badminton-squad
├── .github/workflows/deploy.yml
├── src/
│   ├── main.jsx
│   ├── App.jsx               ← 5-state view machine (no router)
│   ├── index.css             ← all color tokens + animation keyframes
│   ├── components/
│   │   ├── Setup.jsx
│   │   ├── Schedule.jsx
│   │   ├── MatchLogger.jsx
│   │   ├── Results.jsx
│   │   ├── Leaderboard.jsx
│   │   └── Animations.jsx
│   └── lib/
│       ├── github.js         ← readHistory() + writeHistory()
│       ├── grok.js           ← generateSchedule() + generateSummary()
│       └── tournament.js     ← pure rotation + stats logic
├── public/history.json       ← local dev fallback seed
├── history.json              ← THE live database (repo root)
├── vite.config.js            ← base: '/badminton-squad/'
├── tailwind.config.js
└── package.json
```

---

## Key Constants

- GitHub repo: `mavinash-dev/badminton-squad`
- history.json path in repo: `history.json` (root)
- Grok model: `grok-4`
- Grok base URL: `https://api.x.ai/v1/chat/completions`
- Deployed URL: `https://mavinash-dev.github.io/badminton-squad/`
- Vite base: `/badminton-squad/`

---

## Tournament Rotation Logic (critical — in tournament.js)

### 4 Players — 2v2 Rotating
Three fixed matchups covering all pair combinations:
- Match 1: `[p1,p2]` vs `[p3,p4]`
- Match 2: `[p1,p3]` vs `[p2,p4]`
- Match 3: `[p1,p4]` vs `[p2,p3]`

1h → 3 games, first to 21 | 2h → Best-of-3 sets per matchup

### 3 Players — 1v2 Handicap Rotation
Each player gets a solo turn:
- Match 1: `[p1]` vs `[p2,p3]`
- Match 2: `[p2]` vs `[p1,p3]`
- Match 3: `[p3]` vs `[p1,p2]`

1h → 2 full rotations (6 games to 15) | 2h → 4 rotations (12 games to 15/21)

### Duo Key Convention
Always sort player IDs alphabetically: `p1_p3` never `p3_p1`. Enforced in tournament.js.

---

## Hard Constraints

- No backend server — static site only
- No localStorage — secrets come from build-time env vars
- No third-party animation libraries — all animations are hand-written CSS/SVG
- history.json writes must include the current SHA (prevents overwrites)
- All animations listed in the spec are non-negotiable (shuttle, racket, confetti, net, shimmer, radar, fade-up)

---

## Key Decisions Already Made

- `history.json` in GitHub repo = the database — no Supabase, no Firebase
- Grok API for both schedule generation AND post-match summary
- 5-state view machine in App.jsx (`setup → schedule → logging → results → leaderboard`) — no React Router
- Pure logic in `tournament.js` (no React, easy to unit test)
- Keys baked into bundle at build time — accepted security risk for private friend group

---

## Secrets Setup (one-time, repo owner)

1. GitHub repo → Settings → Secrets and variables → Actions
2. Add `GH_PAT` — Personal Access Token with `contents:write` scope on this repo
3. Add `GROK_API_KEY` — key from api.x.ai

For local dev: create `.env.local` (gitignored) with `VITE_GH_PAT=...` and `VITE_GROK_API_KEY=...`

---

## Project Files

- `PRD.md` — Full product requirements
- `ARCH.md` — Technical architecture and data model
- `DESIGN.md` — UX flows, key screens, animation reference, color tokens
- `STATUS.md` — Development log, tasks, time tracking
- `README.md` — Public summary
- `BADMINTON_TRACKER_PROJECT.md` — The original full implementation brief (in repo root)

---

## How to Continue This Project

1. Read `STATUS.md` → Current Focus + Pending Tasks
2. Check if the Vite project has been scaffolded yet (`ls src/` in the repo)
3. Follow implementation order from `BADMINTON_TRACKER_PROJECT.md` → "Implementation Order" section
4. On session end: update `STATUS.md` → Development Log + Time Tracker
