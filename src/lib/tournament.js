export function generateMatches(players, hours) {
  const n = players.length;
  const matches = [];

  if (n === 4) {
    const rotations = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]],
    ];
    const format = hours === 1 ? 'First to 21' : 'Best of 3 sets (first to 21)';
    rotations.forEach(([a, b], i) => {
      matches.push({
        matchId: i + 1,
        teamA: [players[a].id, players[a + (a === 0 ? 1 : 0)].id].filter((_, j) => j === 0 ? true : true),
        teamB: [],
        format,
      });
      // rebuild properly
      matches[i].teamA = [players[rotations[i][0][0]].id, players[rotations[i][0][1]].id];
      matches[i].teamB = [players[rotations[i][1][0]].id, players[rotations[i][1][1]].id];
    });
  } else {
    // 3 players — 1v2 handicap
    const format = hours === 1 ? 'First to 15 (2 rotations)' : 'First to 21 (4 rotations)';
    const reps = hours === 1 ? 2 : 4;
    for (let r = 0; r < reps; r++) {
      for (let solo = 0; solo < 3; solo++) {
        const others = players.filter((_, i) => i !== solo).map(p => p.id);
        matches.push({
          matchId: matches.length + 1,
          teamA: [players[solo].id],
          teamB: others,
          format,
        });
      }
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

  const mvp = players.reduce((best, p) =>
    (wins[p.id] || 0) > (wins[best.id] || 0) ? p : best
  ).id;

  // best duo from matches
  const duoWins = {};
  matches.forEach(m => {
    if (!m.winner) return;
    const team = m.winner === 'A' ? m.teamA : m.teamB;
    if (team.length === 2) {
      const k = duoKey(team[0], team[1]);
      duoWins[k] = (duoWins[k] || 0) + 1;
    }
  });

  const bestDuo = Object.entries(duoWins).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { mvp, bestDuo, wins };
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
