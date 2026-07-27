import { BadmintonNet } from './Animations';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';

function TeamPill({ ids }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {ids.map(id => {
        const p = SQUAD.find(q => q.id === id);
        if (!p) return <span key={id}>{id}</span>;
        return (
          <span key={id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: `${p.color}12`,
            border: `1.5px solid ${p.color}40`,
            borderRadius: 10, padding: '5px 10px 5px 5px',
            fontSize: 13, fontWeight: 700, color: p.color,
          }}>
            <Avatar player={p} size={22} border={false} />
            {p.name}
          </span>
        );
      })}
    </div>
  );
}

export default function Schedule({ matches, players, onLogWinner, onViewResults, onBack }) {
  const allLogged = matches.every(m => m.winner);
  const loggedCount = matches.filter(m => m.winner).length;

  function winnerNames(m) {
    const team = m.winner === 'A' ? m.teamA : m.teamB;
    return team.map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 20, flex: 1 }}>Match Schedule</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dot-live" />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>{loggedCount}/{matches.length}</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <BadmintonNet />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {matches.map((m, i) => {
          const won = m.winner ? winnerNames(m) : null;
          return (
            <div
              key={m.matchId}
              className={`card ${m.winner ? 'winner-glow' : ''}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Match {m.matchId}
                </span>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{m.format}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <TeamPill ids={m.teamA} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'var(--fg-muted)', fontWeight: 800, fontSize: 13 }}>vs</span>
                  {(m.teamA.length !== m.teamB.length) && (
                    <span style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 600, marginTop: 2 }}>
                      {m.teamA.length}v{m.teamB.length}
                    </span>
                  )}
                </div>
                <TeamPill ids={m.teamB} />
              </div>

              <div style={{ marginTop: 14 }}>
                {won ? (
                  <span className="scale-pop" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--green-bg)', color: 'var(--green)',
                    border: '1.5px solid rgba(45,106,79,.3)', borderRadius: 8,
                    padding: '5px 12px', fontSize: 13, fontWeight: 700,
                  }}>
                    🏆 {won}
                  </span>
                ) : (
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => onLogWinner(m.matchId)}>
                    Log Winner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allLogged && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn-primary" onClick={onViewResults} style={{ fontSize: 15 }}>
            View Results →
          </button>
        </div>
      )}
    </div>
  );
}
