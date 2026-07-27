# Product Requirements Document
## Badminton Squad Tracker

**Version:** 0.1
**Author:** Avinash
**Created:** 2026-07-27
**Status:** Draft

---

## 1. Problem Statement

A group of 3–4 friends plays badminton weekly and has no lightweight way to track who plays whom, log match winners, or see who's dominating over time. They manually juggle match rotations and lose session history. There's no shared leaderboard without a spreadsheet or memory.

---

## 2. Vision

> A zero-setup, phone-friendly badminton session companion that generates fair schedules, logs winners, and builds an all-time leaderboard — all shared automatically between friends.

The app lives at a single URL. No accounts, no setup. All friends open the same GitHub Pages link and it just works. History is committed to the GitHub repo as `history.json` — the shared source of truth that outlives any device.

---

## 3. Target Users

### Primary User
- **Who:** A group of 3–4 friends who play badminton weekly
- **Context:** On-court, phone in hand, between games
- **Core pain:** No fair rotation system, no shared win history, no post-session recap

### Not targeted (Phase 1)
- Clubs or organizations with many players
- Tournament-level tracking with granular scoring (only win/loss)
- Any user outside the fixed friend group

---

## 4. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Fair match rotations | All player-pair combinations covered in a session | 100% coverage every session |
| Shared history | history.json committed after every session | Zero data loss |
| Fun engagement | AI summary generated and read | Every session |
| Leaderboard accuracy | All-time win rates correct | Zero calculation errors |

### Non-Goals
- Granular score tracking (no 21–18, just who won)
- Real-time multiplayer / simultaneous edits
- Mobile app (web only)
- Any monetization

---

## 5. Features — Phase 1

### Session Setup
Choose which 3 or 4 players are playing today and set the session duration (1h or 2h). Player names are typed fresh or recalled from history.

### AI Schedule Generation
Calls the Grok API to generate a fair, rotated match schedule based on player count and duration. The schedule is displayed as styled match cards.

### Match Logging
Players tap each match card to log the winner. A modal shows both teams; tapping one records the win. A confetti animation celebrates the result.

### Session Results & AI Summary
After all matches, see a session recap with per-player wins. "Generate AI Summary" calls Grok for a fun 3-sentence post-match commentary. "Save Session" commits everything to `history.json` via the GitHub API.

### All-Time Leaderboard
View all-time stats across all sessions: win rate per player (Best Single Player) and win rate per duo pair (Best Duo). MVP gets a gold shimmer highlight.

---

## 6. Explicitly Out of Scope

- User authentication / accounts
- Granular point scoring
- Real-time sync between devices during a session
- Push notifications
- Any backend server (static + GitHub API only)

---

## 7. User Journey

```
Open app URL (GitHub Pages)
      ↓
Setup: pick players (3 or 4) + duration (1h or 2h)
      ↓
"Generate Schedule" → Grok returns match list
      ↓
Play each match → tap card → log winner → confetti
      ↓
All matches done → Results view → "Generate AI Summary"
      ↓
"Save Session" → history.json committed to GitHub
      ↓
Leaderboard updates with new all-time stats
```

---

## 8. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| GitHub API rate limit | Low | Small group, infrequent writes — well within free limits |
| Grok API downtime | Medium | Show error toast; allow manual schedule fallback (pure tournament.js logic) |
| Concurrent session writes (two players save simultaneously) | Low | SHA-based write prevents silent overwrites; last-writer-wins with clear error |
| API keys in bundle | Medium | Keys baked into GitHub Pages build; repo is public — accept risk, keys are low-sensitivity |

---

## 9. Open Questions

- [ ] Should player names persist between sessions (from history.json) or always be typed fresh?
- [ ] Tie-breaking: is the "Grok vibes" call actually fun or confusing?

---

## 10. Phase Roadmap

| Phase | Timeline | Key Deliverable |
|---|---|---|
| Phase 1 | 2026-07-27 | Full app: setup → schedule → logging → results → leaderboard + GitHub Pages deploy |
| Phase 2 | TBD | Pre-fill player names from history, session history browser, share session as image |
| Phase 3 | TBD | Multi-squad support (different friend groups, separate history files) |
