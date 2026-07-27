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

export async function generateSchedule({ players, matchCount, hours = 1 }) {
  const n = players.length;
  const format = n === 4 ? '2v2 rotating partners' : '1v2 handicap rotation';
  const defaultCount = matchCount || (hours === 2 ? (n === 4 ? 8 : 9) : (n === 4 ? 4 : 6));
  const total = defaultCount;
  const content = await call(
    'You are a badminton tournament scheduler. Return ONLY valid JSON, no markdown, no explanation.',
    `Schedule ${total} badminton matches for ${n} players: ${players.map(p => p.name).join(', ')}.
Format: ${format}. Rotate pairings fairly so every player gets even court time. Game format: "First to 21".
Return exactly: { "matches": [ { "id": 1, "teamA": [...], "teamB": [...], "format": "First to 21" } ] }
Return exactly ${total} matches.`
  );
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return null;
  }
}

export async function generateSummary({ players, matches, sessionLeaderboard }) {
  const mvpPlayer = sessionLeaderboard.mvp ? players.find(p => p.id === sessionLeaderboard.mvp) : null;
  const mvpName = mvpPlayer?.name || null;
  const duoNames = sessionLeaderboard.bestDuo
    ? sessionLeaderboard.bestDuo.split('_').map(id => players.find(p => p.id === id)?.name || id).join(' & ')
    : null;

  return call(
    'You are an energetic sports commentator for a friends badminton group. Be hype, casual, funny, and a little savage. 3 sentences max. No markdown.',
    `Players in this session: ${players.map(p => p.name).join(', ')}.
Match results: ${JSON.stringify(matches.map(m => ({ teamA: m.teamA.map(id => players.find(p=>p.id===id)?.name||id), teamB: m.teamB.map(id => players.find(p=>p.id===id)?.name||id), winner: m.winner === 'A' ? m.teamA.map(id => players.find(p=>p.id===id)?.name||id) : m.winner === 'B' ? m.teamB.map(id => players.find(p=>p.id===id)?.name||id) : null })))}.
${mvpName ? `MVP: ${mvpName}.` : 'It was a tie — no clear MVP today.'}
${duoNames ? `Best duo: ${duoNames}.` : ''}
IMPORTANT: Always refer to players by their actual names (${players.map(p => p.name).join(', ')}). Never say "Player A", "the winner", "they", etc. — use names.
Write a short hype wrap-up${mvpName ? ` declaring ${mvpName} the champion` : ' acknowledging the tie'}. Gently roast the losers by name. Keep it fun and friendly. 3 sentences max.`
  );
}
