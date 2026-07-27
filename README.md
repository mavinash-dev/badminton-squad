# Four Houses — Badminton Squad Tracker

> Track wins, rivalries, and glory — for a group of friends who take their badminton seriously.

---

## Access

| Link | What it does |
|---|---|
| **[mavinash-dev.github.io/badminton-squad](https://mavinash-dev.github.io/badminton-squad/)** | Live app — real data, saves to GitHub |
| **[mavinash-dev.github.io/badminton-squad/?demo](https://mavinash-dev.github.io/badminton-squad/?demo)** | Demo mode — dummy data, no writes, safe to share |

---

## What It Is

A phone-friendly web app for Avinash, Bhavya, Malay, and Rajeev. Open the URL, pick who's playing, choose match count (6 / 9 / 12 / 15), and get a mathematically balanced rotation. Log winners during play, see an AI post-match roast, and track all-time standings.

No accounts. No app install. No configuration.

---

## Features

- **Balanced Schedule** — Deterministic 3-cycle rotation for 4p (every pairing fair); round-robin for 3p
- **Match Logging** — Tap to log winners as you play
- **AI Post-Match Summary** — Groq writes a fun 3-sentence recap roasting the losers by name
- **Player Profiles** — Per-player win rate, duo records, MVP history, and an AI-generated roast
- **All-Time Leaderboard** — Win rates for players and duo pairs across all sessions
- **Casual Play** — Log ad-hoc matches with any combo; counts toward all-time stats
- **War Records** — Full session history with match-by-match breakdown and delete

---

## Status

**Live at:** `https://mavinash-dev.github.io/badminton-squad/`

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
