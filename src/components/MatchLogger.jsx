import { useState } from 'react';
import { Confetti } from './Animations';
import { SQUAD } from '../lib/players';

function TeamButton({ ids, side, winner, onSelect }) {
  const isWinner = winner === side;
  return (
    <button
      onClick={() => !winner && onSelect(side)}
      disabled={!!winner}
      style={{
        flex: 1, padding: '22px 12px',
        borderRadius: 16,
        border: `2px solid ${isWinner ? 'var(--green)' : 'var(--border)'}`,
        background: isWinner ? 'var(--green-bg)' : 'var(--canvas)',
        cursor: winner ? 'default' : 'pointer',
        transition: 'all .2s',
        transform: isWinner ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        {ids.map(id => {
          const p = SQUAD.find(q => q.id === id);
          if (!p) return null;
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: p.color, color: p.textColor || '#f5f0e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800,
                opacity: !winner || isWinner ? 1 : 0.4,
                transition: 'opacity .2s',
              }}>
                {p.initials}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--fg)' }}>
                {p.name}
              </span>
            </div>
          );
        })}
        {isWinner && (
          <span className="scale-pop" style={{ marginTop: 6, fontSize: 13, color: 'var(--green)', fontWeight: 800 }}>
            Winner! 🏆
          </span>
        )}
      </div>
    </button>
  );
}

export default function MatchLogger({ match, onLog, onClose }) {
  const [winner, setWinner] = useState(null);

  function handleSelect(side) {
    setWinner(side);
    setTimeout(() => onLog(match.matchId, side), 1200);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(245,240,232,.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, position: 'relative', padding: 28, animation: 'fadeUp .25s ease both' }}>
        {winner && <Confetti />}

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Match {match.matchId}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Who won?</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>{match.format}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <TeamButton ids={match.teamA} side="A" winner={winner} onSelect={handleSelect} />
          <TeamButton ids={match.teamB} side="B" winner={winner} onSelect={handleSelect} />
        </div>

        {!winner && (
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" onClick={onClose} style={{ fontSize: 13 }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
