# Design Document
## Badminton Squad Tracker

**Version:** 0.1
**Created:** 2026-07-27

---

## 1. Design Principles

1. **Dark dashboard aesthetic** — deep near-black backgrounds, bright green accent, minimal chrome. Feels premium without being loud.
2. **Alive with motion** — shuttlecock arcs, racket swings, confetti bursts, radar pulses. Animations make it feel like a game app, not a spreadsheet.
3. **Phone-first, thumb-friendly** — all primary actions are large tap targets. Used on-court with one hand.
4. **Zero friction** — no login, no setup, no config. Open URL → start playing.
5. **Fun over precision** — AI commentary, vibes-based tie-breaking, confetti on wins. This is for friends, not serious athletes.

---

## 2. Color Tokens

```css
--canvas:   #080f11   /* page background */
--surface:  #0e1518   /* card background */
--elevated: #141c20   /* hover state */
--border:   #1f272b   /* default border */
--border-hi:#2a343a   /* hover/active border */
--fg:       #fdfcf0   /* primary text */
--fg-body:  #f1f0e4   /* body copy */
--fg-muted: #888c8d   /* secondary/metadata text */
--green:    #1ce783   /* primary accent */
--green-bg: rgba(28,231,131,.10)
--court:    #2a4a3a   /* badminton court green */
```

---

## 3. Typography

- **Inter** — body, headings, buttons, cards
- **JetBrains Mono** — eyebrow labels, dates, tags, badges, monospace data

---

## 4. User Flows

### Flow 1: Session Setup → Schedule
```
Open app → Setup view (player name inputs + duration picker)
  → "Generate Schedule" click (racket swing animation)
  → Grok API called → loading spinner
  → Schedule view: match cards fade in with stagger
```
- **Entry point:** App load
- **Exit point:** Schedule view with match list
- **Key decision:** 3 vs 4 players changes rotation format; 1h vs 2h changes game format

### Flow 2: Match Logging
```
Schedule view → tap "Log Winner" on a match card
  → MatchLogger modal opens
  → Tap winning team button
  → Winner recorded: green glow on winning card, confetti burst, "Winner!" badge
  → Modal closes → back to schedule (match card shows winner)
```
- **Entry point:** Match card in Schedule view
- **Exit point:** Schedule view with match marked complete

### Flow 3: Session Results + Save
```
All matches logged → "View Results" → Results view
  → Session recap: per-player win counts
  → "Generate AI Summary" → Grok 3-sentence commentary
  → "Save Session" → GitHub API write → success toast
  → Leaderboard view (all-time stats updated)
```

### Flow 4: Leaderboard Browse
```
Nav button → Leaderboard view
  → readHistory() fetches history.json
  → Best Single Player ranked by win rate
  → Best Duo ranked by win rate
  → MVP card: gold shimmer animation
```

---

## 5. Key Screens

### Screen: Setup
- **Purpose:** Configure the session before generating schedule
- **Key elements:**
  - Player count toggle (3 or 4)
  - Name input fields for each player (pre-populated from history if available)
  - Duration picker (1h / 2h)
  - "Generate Schedule" CTA button (primary green)
- **User action:** Fill names, pick duration, tap generate

### Screen: Schedule
- **Purpose:** Display AI-generated match cards; entry to logging
- **Key elements:**
  - Session header (date, duration, player count)
  - Badminton net SVG divider (decorative, aria-hidden)
  - Match cards (stagger fade-in): teams, format, "Log Winner" button
  - Completed matches show winner badge
  - "View Results" button (active when all matches logged)
- **User action:** Tap "Log Winner" per match

### Screen: MatchLogger (modal)
- **Purpose:** Record which team won a specific match
- **Key elements:**
  - Match title (e.g. "Match 2")
  - Team A button (large, full-width half)
  - Team B button (large, full-width half)
  - Cancel/back
- **User action:** Tap winning team → triggers confetti + glow

### Screen: Results
- **Purpose:** Session recap before saving
- **Key elements:**
  - Per-player win count for this session
  - Session MVP + Best Duo callouts
  - "Generate AI Summary" button → inline text block
  - "Save Session" button → writes to GitHub
- **User action:** Generate summary, then save

### Screen: Leaderboard
- **Purpose:** All-time rankings across all sessions
- **Key elements:**
  - "Best Single Player" section — ranked cards with win rate
  - "Best Duo" section — pair cards with win rate
  - MVP card: gold shimmer animation
  - Radar pulse dot next to "Live" indicator
- **User action:** Browse / admire

---

## 6. Animations Reference

| Animation | Trigger | Duration | Component |
|---|---|---|---|
| Shuttlecock arc | Page load + view transitions | one-shot parabola | Animations.jsx |
| Racket swing | Primary button click | 300ms ease-out | Animations.jsx |
| Badminton net divider | Static decoration | — | Schedule.jsx |
| Winner confetti burst | Match winner logged | 1.5s auto-remove | MatchLogger.jsx |
| Winner green glow pulse | Match winner logged | 600ms | MatchLogger.jsx |
| MVP gold shimmer | Leaderboard #1 card | infinite sweep | Leaderboard.jsx |
| Radar pulse dot | Live indicator | 1.6s infinite | index.css |
| Card fade-up on load | Any card render | 350ms stagger 80ms/card | index.css |

---

## 7. Design Decisions

### Top green band
- **Chose:** 5px solid `--green` bar at the very top of the page
- **Because:** Instantly establishes the accent color and feels like a premium dashboard

### Dot-grid background
- **Chose:** `radial-gradient` repeating dot pattern at 24px spacing
- **Because:** Adds depth without visual noise; common in dark dev tools / dashboards

### Cards with hover lift
- **Chose:** `transform: translateY(-1px)` on hover + border color change
- **Because:** Tactile feedback on desktop; subtle signal of interactivity

### Eyebrow labels
- **Chose:** JetBrains Mono, 10px, uppercase, letter-spaced, with trailing 1px rule
- **Because:** Creates clear section hierarchy without heavy headings; technical/sporty feel

---

## 8. Design Resources

- Figma / wireframes: none (implemented directly from spec)
- Design system: custom, defined in `index.css` CSS custom properties
- Fonts: Inter + JetBrains Mono (Google Fonts)
- Colors: see Color Tokens above
