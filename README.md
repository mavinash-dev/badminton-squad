# Badminton Squad Tracker

> Zero-setup badminton session tracker for a friend group — AI schedules, match logging, all-time leaderboard.

---

## What It Is

A phone-friendly web app for a group of 3–4 friends who play badminton weekly. Open one shared URL, pick who's playing and for how long, get an AI-generated fair match schedule, log winners during play, and see a fun AI post-match summary. All history is saved to the GitHub repo — the leaderboard updates automatically.

No accounts. No app install. No configuration. Just open the URL and play.

---

## Why It Exists

Weekly badminton sessions with friends meant manually figuring out fair rotations, forgetting who won last week, and having no shared record of the all-time champion. This solves all three.

---

## Features

- **AI Schedule** — Grok generates fair rotated matches (2v2 or 1v2 handicap) for your session length
- **Match Logging** — Tap to log winners; confetti celebrates each result
- **AI Post-Match Summary** — Grok writes a fun 3-sentence recap roasting the losers
- **All-Time Leaderboard** — Win rates for players and duo pairs across all sessions
- **Shared History** — `history.json` committed to this repo; everyone sees the same data

---

## Status

**Phase:** Phase 1 — Full Implementation
**Stage:** In Development
**Live at:** `https://mavinash-dev.github.io/badminton-squad/` (after deploy)

---

## Tech Stack

- React + Vite (static, GitHub Pages)
- Tailwind CSS + hand-written CSS animations
- `@octokit/rest` for GitHub API storage
- Grok API (`grok-4`) for AI features
- GitHub Actions for CI/CD deploy

---

## Running Locally

```bash
git clone https://github.com/mavinash-dev/badminton-squad.git
cd badminton-squad
npm install
```

Create `.env.local`:
```
VITE_GH_PAT=your_pat_here
VITE_GROK_API_KEY=your_grok_key_here
```

```bash
npm run dev
# Opens at http://localhost:5173/badminton-squad/
```

## Deploying

```bash
# Via GitHub Actions (automatic on push to main)
git push origin main

# Or manually
npm run deploy
```

---

## Project Docs

| Document | Purpose |
|---|---|
| [PRD.md](PRD.md) | Product requirements |
| [ARCH.md](ARCH.md) | Technical architecture |
| [DESIGN.md](DESIGN.md) | UX flows and design |
| [STATUS.md](STATUS.md) | Development log and tasks |
| [CLAUDE.md](CLAUDE.md) | Full brief for AI-assisted development |
