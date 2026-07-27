import Groq from 'groq-sdk';

// Uses groq.com API — same as tech-intel's Python groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROK_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = 'llama-3.3-70b-versatile';

async function call(system, user) {
  const resp = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
  });
  return resp.choices[0].message.content.trim();
}

export async function generateSchedule({ players, hours }) {
  const n = players.length;
  const format = n === 4 ? '2v2 rotating partners' : '1v2 handicap rotation';
  const content = await call(
    'You are a badminton tournament scheduler. Return ONLY valid JSON, no markdown, no explanation.',
    `Schedule a ${hours}-hour badminton session for ${n} players: ${players.map(p => p.name).join(', ')}.
Format: ${format}. Include match number, teamA (array of player names), teamB, and game format (e.g. "First to 21").
Return exactly: { "matches": [ { "id": 1, "teamA": [...], "teamB": [...], "format": "..." } ] }`
  );
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return null;
  }
}

export async function generateSummary({ players, matches, sessionLeaderboard }) {
  const mvpPlayer = players.find(p => p.id === sessionLeaderboard.mvp);
  const mvpName = mvpPlayer?.name || sessionLeaderboard.mvp;
  const duoNames = sessionLeaderboard.bestDuo
    ? sessionLeaderboard.bestDuo.split('_').map(id => players.find(p => p.id === id)?.name || id).join(' & ')
    : null;

  return call(
    'You are an energetic sports commentator for a friends badminton group. Be hype, casual, funny, and a little savage. 3 sentences max. No markdown.',
    `Match results: ${JSON.stringify(matches.map(m => ({ teamA: m.teamA.map(id => players.find(p=>p.id===id)?.name||id), teamB: m.teamB.map(id => players.find(p=>p.id===id)?.name||id), winner: m.winner })))}.
MVP: ${mvpName}. ${duoNames ? `Best duo: ${duoNames}.` : ''}
Write a short hype wrap-up declaring the day's champion and gently roasting the losers. Keep it fun and friendly.`
  );
}
