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

export async function generatePlayerRoast({ player, winRate, wins, games, sessions, mvpCount, bestPartner }) {
  return call(
    'You are a savage but lovable sports commentator for a friends badminton group. Be hype, funny, brutally honest. 2-3 sentences max. No markdown.',
    `Write a personalized player card roast/hype for ${player.name}.
Stats: ${wins} wins from ${games} matches (${winRate}% win rate), played ${sessions} sessions, MVP ${mvpCount} time${mvpCount !== 1 ? 's' : ''}.
${bestPartner ? `Best partner: ${bestPartner}.` : 'No standout partner yet.'}
If win rate is above 60%: hype them up but warn rivals. If 40-60%: backhanded compliment. Below 40%: roast them but keep it friendly.
Always use their actual name: ${player.name}. 2-3 sentences only.`
  );
}

export async function generateSummary({ players, matches, sessionLeaderboard }) {
  const name = id => players.find(p => p.id === id)?.name || id;
  const mvpName = sessionLeaderboard.mvp ? name(sessionLeaderboard.mvp) : null;
  const duoLabel = sessionLeaderboard.bestDuo
    ? sessionLeaderboard.bestDuo.split('_').map(name).join(' & ') : null;

  // Per-player win counts
  const wins = {};
  players.forEach(p => { wins[p.name] = 0; });
  matches.forEach(m => {
    if (!m.winner) return;
    (m.winner === 'A' ? m.teamA : m.teamB).forEach(id => { wins[name(id)] = (wins[name(id)] || 0) + 1; });
  });
  const scoreline = players.map(p => `${p.name}: ${wins[p.name]}W`).join(', ');

  // Match-by-match narrative
  const matchSummary = matches
    .filter(m => m.winner)
    .map(m => {
      const a = m.teamA.map(name).join(' & ');
      const b = m.teamB.map(name).join(' & ');
      const winner = m.winner === 'A' ? a : b;
      const loser = m.winner === 'A' ? b : a;
      return `${winner} beat ${loser}`;
    }).join('; ');

  return call(
    'You are a savage but lovable sports commentator for a friends badminton group. Be hype, funny, brutally honest. 3 sentences max. No markdown.',
    `Session scoreline: ${scoreline}.
Match results: ${matchSummary}.
${mvpName ? `MVP this session: ${mvpName}.` : 'No MVP — it was a tie.'}
${duoLabel ? `Deadliest duo: ${duoLabel}.` : ''}
Players: ${players.map(p => p.name).join(', ')}.
Write a punchy 3-sentence post-match wrap-up. Call out the MVP by name, roast the bottom player by name, mention the best partnership if there is one. Always use real names — never "the winner" or "they".`
  );
}
