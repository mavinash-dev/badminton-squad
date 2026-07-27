# Architecture Document
## Badminton Squad Tracker

**Version:** 0.1
**Created:** 2026-07-27

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast dev, clean component model, standard GitHub Pages deploy |
| Styling | Tailwind CSS + custom CSS | Utility-first + full control for badminton-themed animations |
| Storage | `history.json` in GitHub repo | Zero server; shared source of truth committed via API |
| GitHub API | `@octokit/rest` | Read/write `history.json` via GitHub Contents API |
| AI | Grok API (`api.x.ai`, model: `grok-4`) | Schedule generation + post-match commentary |
| Deploy | `gh-pages` npm package | `npm run deploy` → pushes `dist/` to `gh-pages` branch |
| Secrets | GitHub Actions secrets → Vite env vars | Keys baked into bundle at build time |

---

## 2. Architecture Overview

```
Browser (GitHub Pages)
  │
  ├── React App (static bundle, no server)
  │     ├── src/lib/grok.js        → Grok API (schedule + summary)
  │     ├── src/lib/github.js      → GitHub Contents API (read/write history.json)
  │     └── src/lib/tournament.js  → Pure rotation + stats logic
  │
  ├── history.json (repo root)     ← live database, versioned in git
  │
  └── GitHub Actions (deploy.yml)  → builds with secrets → pushes to gh-pages branch
```

No backend server. No database. No auth. The GitHub repo IS the backend.

---

## 3. Data Model

```
history.json root
  players: Player[]
  duos: { [duoKey: string]: DuoStats }
  sessions: Session[]

Player
  id: string          (e.g. "p1")
  name: string
  wins: number        (all-time)
  games: number       (all-time)

DuoStats
  wins: number
  games: number
  (key: sorted player IDs joined by "_", e.g. "p1_p3" never "p3_p1")

Session
  id: string          (e.g. "s_20260727_001")
  date: string        (ISO date)
  duration: number    (1 or 2)
  playerCount: number (3 or 4)
  matches: Match[]
  sessionLeaderboard: { mvp: string, bestDuo: string }
  aiSummary: string

Match
  matchId: number
  teamA: string[]     (player IDs)
  teamB: string[]     (player IDs)
  format: string      (e.g. "first to 21")
  winner: "A" | "B" | null
```

---

## 4. External APIs & Integrations

| API | Purpose | Rate Limits | Notes |
|---|---|---|---|
| Grok API (`api.x.ai`) | Schedule generation + post-match summary | Per x.ai plan | Model: `grok-4`. Returns JSON for schedule, plain text for summary |
| GitHub Contents API | Read and write `history.json` | 5000 req/hr authenticated | Must pass current SHA on write to prevent conflicts |

---

## 5. Key Technical Decisions

### Decision 1: history.json in GitHub repo as database
- **Chose:** GitHub Contents API to read/write a JSON file committed to the repo
- **Over:** Supabase, Firebase, localStorage
- **Because:** Zero server cost, zero setup for friends, version-controlled history, all 4 players share the same URL with no accounts

### Decision 2: Keys baked into bundle at build time
- **Chose:** GitHub Actions secrets → Vite `VITE_` env vars → compiled into JS bundle
- **Over:** Backend proxy, user-supplied keys, localStorage
- **Because:** Frictionless for friends — open URL and it works. Keys are low-sensitivity (GitHub PAT scoped to one repo, Grok key with usage limits)

### Decision 3: No router — view state machine in App.jsx
- **Chose:** `currentView` string with 5 states
- **Over:** React Router, Next.js
- **Because:** App has a linear flow with no deep linking needed; avoids GitHub Pages routing complexity with hash URLs

### Decision 4: Pure logic in tournament.js
- **Chose:** All rotation and stats calculation in plain JS functions, no React
- **Over:** Computing inline in components
- **Because:** Testable, portable, easy to reason about independently of UI

---

## 6. Infrastructure & Deployment

- **Environments:** local (`.env.local`) / production (GitHub Pages)
- **CI/CD:** GitHub Actions on push to `main` — builds with secrets, deploys to `gh-pages` branch
- **Domain:** `mavinash-dev.github.io/badminton-squad/`
- **Secrets management:** `GH_PAT` + `GROK_API_KEY` stored as GitHub Actions secrets; passed as `VITE_` env vars at build time

---

## 7. Security Considerations

- API keys are embedded in the public JS bundle — accepted risk for a private friend group
- GitHub PAT scoped to `contents:write` on this repo only — minimal blast radius
- SHA-based writes to `history.json` prevent silent data overwrites

---

## 8. Performance Considerations

- Static site — instant load from GitHub Pages CDN
- Grok API calls are async with loading states; no blocking
- `history.json` read happens once on leaderboard view mount

---

## 9. Open Technical Questions

- [ ] Should `history.json` be read on app start to pre-fill player names, or only on leaderboard view?
- [ ] How to handle Grok returning malformed JSON for schedule? Add a parse fallback using tournament.js deterministic logic.
