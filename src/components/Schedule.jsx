import { BadmintonNet } from './Animations';

function TeamChip({ ids, players }) {
  const names = ids.map(id => players.find(p => p.id === id)?.name || id);
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {names.map((n, i) => (
        <span
          key={i}
          style={{
            background: 'var(--green-bg)', color: 'var(--green)',
            borderRadius: 6, padding: '4px 10px',
            fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(28,231,131,0.2)',
          }}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export default function Schedule({ matches, players, onLogWinner, onViewResults }) {
  const allLogged = matches.every(m => m.winner);
  const loggedCount = matches.filter(m => m.winner).length;

  function winnerLabel(m) {
    if (!m.winner) return null;
    const team = m.winner === 'A' ? m.teamA : m.teamB;
    const names = team.map(id => players.find(p => p.id === id)?.name || id);
    return names.join(' & ');
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="eyebrow" style={{ flex: 1 }}>Match Schedule</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16, whiteSpace: 'nowrap' }}>
          <span className="dot-live" />
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--fg-muted)' }}>
            {loggedCount}/{matches.length} logged
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <BadmintonNet />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {matches.map((m, i) => {
          const winner = winnerLabel(m);
          return (
            <div
              key={m.matchId}
              className={`card ${m.winner ? 'winner-glow' : ''}`}
              style={{
                animationDelay: `calc(${i} * 80ms)`,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  Match {m.matchId}
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{m.format}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <TeamChip ids={m.teamA} players={players} />
                <span style={{ color: 'var(--fg-muted)', fontWeight: 700 }}>vs</span>
                <TeamChip ids={m.teamB} players={players} />
              </div>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {winner ? (
                  <span className="scale-pop" style={{
                    background: 'var(--green-bg)', color: 'var(--green)',
                    border: '1px solid var(--green)', borderRadius: 8,
                    padding: '5px 14px', fontSize: 13, fontWeight: 700,
                  }}>
                    🏆 {winner}
                  </span>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => onLogWinner(m.matchId)}
                    style={{ fontSize: 13 }}
                  >
                    Log Winner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allLogged && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <button
            className="btn-primary"
            onClick={onViewResults}
            style={{ fontSize: 16 }}
          >
            View Results →
          </button>
        </div>
      )}
    </div>
  );
}
