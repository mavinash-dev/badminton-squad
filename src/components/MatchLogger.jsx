import { useState } from 'react';
import { Confetti } from './Animations';

export default function MatchLogger({ match, players, onLog, onClose }) {
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  function getNames(ids) {
    return ids.map(id => players.find(p => p.id === id)?.name || id);
  }

  function handleSelect(side) {
    setWinner(side);
    setShowConfetti(true);
    setTimeout(() => {
      onLog(match.matchId, side);
    }, 1200);
  }

  const teamANames = getNames(match.teamA);
  const teamBNames = getNames(match.teamB);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(8,15,17,.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(4px)',
    }}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: 480, position: 'relative', padding: 32, animation: 'fadeUp .25s ease both' }}
      >
        {showConfetti && <Confetti />}

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 8 }}>
            Match {match.matchId}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Who won?</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>{match.format}</div>
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          {[{ side: 'A', names: teamANames }, { side: 'B', names: teamBNames }].map(({ side, names }) => (
            <button
              key={side}
              onClick={() => !winner && handleSelect(side)}
              disabled={!!winner}
              style={{
                flex: 1,
                padding: '20px 12px',
                borderRadius: 14,
                border: `2px solid ${winner === side ? 'var(--green)' : 'var(--border)'}`,
                background: winner === side ? 'var(--green-bg)' : 'var(--canvas)',
                cursor: winner ? 'default' : 'pointer',
                transition: 'all .2s',
                transform: winner === side ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {names.map((n, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 15, fontWeight: 700,
                      color: winner === side ? 'var(--green)' : 'var(--fg)',
                    }}
                  >
                    {n}
                  </span>
                ))}
                {winner === side && (
                  <span className="scale-pop" style={{ marginTop: 8, fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
                    Winner! 🏆
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {!winner && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" onClick={onClose} style={{ fontSize: 13 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
