export function generateMatches(players, count) {
  const n = players.length;
  const matches = [];

  if (n === 4) {
    const rotations = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]],
    ];
    const total = count || 6;
    for (let i = 0; i < total; i++) {
      const r = rotations[i % 3];
      matches.push({
        matchId: i + 1,
        teamA: [players[r[0][0]].id, players[r[0][1]].id],
        teamB: [players[r[1][0]].id, players[r[1][1]].id],
        format: 'First to 21',
      });
    }
  } else {
    // 3 players — 1v2 handicap rotation
    const total = count || 6;
    for (let i = 0; i < total; i++) {
      const solo = i % 3;
      const others = players.filter((_, j) => j !== solo).map(p => p.id);
      matches.push({
        matchId: i + 1,
        teamA: [players[solo].id],
        teamB: others,
        format: 'First to 15',
      });
    }
  }
  return matches;
}

export function duoKey(id1, id2) {
  return [id1, id2].sort().join('_');
}

export function calcSessionLeaderboard(players, matches) {
  const wins = {};
  players.forEach(p => { wins[p.id] = 0; });

  matches.forEach(m => {
    if (!m.winner) return;
    const winners = m.winner === 'A' ? m.teamA : m.teamB;
    winners.forEach(id => { wins[id] = (wins[id] || 0) + 1; });
  });

  // MVP — null if tied
  const maxWins = Math.max(...players.map(p => wins[p.id] || 0));
  const mvpCandidates = players.filter(p => (wins[p.id] || 0) === maxWins);
  const mvp = maxWins > 0 && mvpCandidates.length === 1 ? mvpCandidates[0].id : null;

  // Best duo — null if tied or no duo matches
  const duoWins = {};
  matches.forEach(m => {
    if (!m.winner) return;
    const team = m.winner === 'A' ? m.teamA : m.teamB;
    if (team.length === 2) {
      const k = duoKey(team[0], team[1]);
      duoWins[k] = (duoWins[k] || 0) + 1;
    }
  });

  const duoEntries = Object.entries(duoWins).sort((a, b) => b[1] - a[1]);
  const topDuoWins = duoEntries[0]?.[1] || 0;
  const topDuos = duoEntries.filter(([, v]) => v === topDuoWins);
  const bestDuo = topDuoWins > 0 && topDuos.length === 1 ? topDuos[0][0] : null;

  return { mvp, bestDuo, wins, mvpTied: maxWins > 0 && mvpCandidates.length > 1, duoTied: topDuoWins > 0 && topDuos.length > 1 };
}

export function mergeSessionIntoHistory(history, session, players, matches) {
  const { wins, mvp, bestDuo } = calcSessionLeaderboard(players, matches);

  // upsert players
  const playerMap = {};
  history.players.forEach(p => { playerMap[p.id] = p; });

  players.forEach(p => {
    if (!playerMap[p.id]) {
      playerMap[p.id] = { id: p.id, name: p.name, wins: 0, games: 0 };
    } else {
      playerMap[p.id].name = p.name;
    }
    const gamesPlayed = matches.filter(m => m.winner && (m.teamA.includes(p.id) || m.teamB.includes(p.id))).length;
    playerMap[p.id].wins += wins[p.id] || 0;
    playerMap[p.id].games += gamesPlayed;
  });
  history.players = Object.values(playerMap);

  // update duos
  matches.forEach(m => {
    if (!m.winner) return;
    const winning = m.winner === 'A' ? m.teamA : m.teamB;
    const losing = m.winner === 'A' ? m.teamB : m.teamA;
    const allPairs = [];
    if (winning.length === 2) allPairs.push({ key: duoKey(winning[0], winning[1]), win: true });
    if (losing.length === 2) allPairs.push({ key: duoKey(losing[0], losing[1]), win: false });
    allPairs.forEach(({ key, win }) => {
      if (!history.duos[key]) history.duos[key] = { wins: 0, games: 0 };
      history.duos[key].games += 1;
      if (win) history.duos[key].wins += 1;
    });
  });

  history.sessions.push(session);
  return history;
}

export function calcLeaderboard(history) {
  const players = history.players.map(p => ({
    ...p,
    winRate: p.games > 0 ? p.wins / p.games : 0,
  })).sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  const duos = Object.entries(history.duos)
    .filter(([, v]) => v.games > 0)
    .map(([key, v]) => ({
      key,
      wins: v.wins,
      games: v.games,
      winRate: v.wins / v.games,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  return { players, duos };
}

export function playerName(id, players) {
  return players.find(p => p.id === id)?.name || id;
}
