const GROK_BASE = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-3';

async function callGrok(system, user) {
  const res = await fetch(GROK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Grok API error: ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

export async function generateSchedule({ players, hours }) {
  const n = players.length;
  const format = n === 4 ? '2v2 rotating partners' : '1v2 handicap rotation';
  const content = await callGrok(
    'You are a badminton tournament scheduler. Return ONLY valid JSON, no markdown, no explanation.',
    `Schedule a ${hours}-hour badminton session for ${n} players: ${players.map(p => p.name).join(', ')}.
Format: ${format}. Include match number, teamA (array of player names), teamB, and game format (e.g. "First to 21").
Return exactly: { "matches": [ { "id": 1, "teamA": [...], "teamB": [...], "format": "..." } ] }`
  );
  try {
    return JSON.parse(content);
  } catch {
    // Return null to signal fallback to deterministic schedule
    return null;
  }
}

export async function generateSummary({ players, matches, sessionLeaderboard }) {
  const mvpPlayer = players.find(p => p.id === sessionLeaderboard.mvp);
  const mvpName = mvpPlayer?.name || sessionLeaderboard.mvp;
  return callGrok(
    'You are an energetic sports commentator for a friends badminton group. Be hype, casual, and fun. 3 sentences max. No markdown.',
    `Match results: ${JSON.stringify(matches)}. Players: ${JSON.stringify(players.map(p => p.name))}.
MVP this session: ${mvpName}. Best duo key: ${sessionLeaderboard.bestDuo}.
Write a short, hype tournament wrap-up declaring the champion and gently roasting the losers. Keep it friendly and fun.`
  );
}
