# Project Status
## Badminton Squad Tracker

<!-- DASHBOARD_META
name: Badminton Squad Tracker
slug: badminton-squad
status: Active
phase: Phase 1
started: 2026-07-27
last_updated: 2026-07-27
summary: Phone-friendly badminton session tracker for a friend group — AI schedules, match logging, all-time leaderboard, zero setup.
current_focus: Full implementation — scaffolding Vite + React app and building all components per the project brief.
-->

---

## Current Phase
**Phase 1** — Full app implementation

## Status
`Active` — Implementation in progress

---

## Current Focus
Implementing all components from scratch: Setup → Schedule → MatchLogger → Results → Leaderboard, with Grok API integration, GitHub history storage, and all CSS animations.

---

## Development Log
<!-- Newest entry first. Add an entry every session. -->

### 2026-07-27 — Session 1
**Done:**
- [x] Brainstormed and spec'd full product (BADMINTON_TRACKER_PROJECT.md)
- [x] Created project foundation (PRD, ARCH, DESIGN, STATUS, CLAUDE.md, README)

**Decisions:**
- history.json in GitHub repo as zero-server database
- Grok API for schedule generation and post-match summary
- GitHub Pages deploy via gh-pages npm package + GitHub Actions
- No router — 5-state view machine in App.jsx

**Time:** 1h

---

## Pending Tasks

### Phase 1 — Implementation
- [ ] Scaffold Vite + React project, install deps (`@octokit/rest`, `tailwindcss`, `gh-pages`) — est: 0.5h
- [ ] Set up `index.css` with all color tokens, typography, and animation keyframes — est: 0.5h
- [ ] Implement `src/lib/tournament.js` — pure rotation + stats logic — est: 1h
- [ ] Implement `src/lib/github.js` — readHistory + writeHistory — est: 0.5h
- [ ] Implement `src/lib/grok.js` — generateSchedule + generateSummary — est: 0.5h
- [ ] Build `App.jsx` view state machine — est: 0.5h
- [ ] Build `Setup.jsx` — player name inputs + duration picker — est: 1h
- [ ] Build `Schedule.jsx` — AI match cards + net decoration — est: 1h
- [ ] Build `MatchLogger.jsx` — winner modal + confetti — est: 1h
- [ ] Build `Results.jsx` — session recap + AI summary + save — est: 1h
- [ ] Build `Leaderboard.jsx` — all-time stats + MVP shimmer — est: 1h
- [ ] Build `Animations.jsx` — shuttle, racket, confetti SVGs — est: 1h
- [ ] Wire animations into each view — est: 0.5h
- [ ] Create history.json seed file in repo root — est: 0.25h
- [ ] Create `.github/workflows/deploy.yml` — est: 0.25h
- [ ] Test locally + push + verify GitHub Pages — est: 1h

### Phase 2 (future)
- [ ] Pre-fill player names from history.json on setup
- [ ] Session history browser (browse past sessions)
- [ ] Share session as image (canvas screenshot)

---

## Blockers
- Need `GH_PAT` and `GROK_API_KEY` added to GitHub Actions secrets before deploy works

---

## Time Tracker

| Date | Session | Hours | Cumulative |
|---|---|---|---|
| 2026-07-27 | Brainstorm + Project Setup | 1h | 1h |

---

## Key Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-27 | history.json in GitHub repo as database | Zero server, zero cost, version-controlled, shared among friends |
| 2026-07-27 | Grok API (grok-4) for AI features | Schedule generation + fun post-match commentary |
| 2026-07-27 | No router, 5-state view machine | Linear flow, no deep linking needed, avoids GH Pages hash complexity |
| 2026-07-27 | Keys baked into bundle at build time | Frictionless for friends — no accounts, no setup |
