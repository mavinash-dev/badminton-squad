import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';

function TeamButton({ ids, side, winner, onSelect }) {
  const isWinner = winner === side;
  const isLoser = winner && winner !== side;

  return (
    <button
      onClick={() => !winner && onSelect(side)}
      disabled={!!winner}
      style={{
        flex: 1, padding: '18px 10px',
        borderRadius: 16,
        border: `2px solid ${isWinner ? 'var(--green)' : isLoser ? 'var(--border)' : 'var(--border)'}`,
        background: isWinner ? 'var(--green-bg)' : 'var(--canvas)',
        cursor: winner ? 'default' : 'pointer',
        transition: 'all .2s',
        opacity: isLoser ? 0.45 : 1,
        transform: isWinner ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {ids.map(id => {
          const p = SQUAD.find(q => q.id === id);
          if (!p) return null;
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Avatar player={p} size={44} border={false} />
              <span style={{ fontSize: 13, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--fg)' }}>
                {p.name}
              </span>
            </div>
          );
        })}
        {isWinner && (
          <div className="scale-pop" style={{ marginTop: 4, fontSize: 18 }}>✓</div>
        )}
      </div>
    </button>
  );
}

export default function MatchLogger({ match, onLog, onClose }) {
  const [winner, setWinner] = useState(null);

  function handleSelect(side) {
    setWinner(side);
    // Short pause so user sees the checkmark, then auto-close
    setTimeout(() => onLog(match.matchId, side), 700);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(245,240,232,.90)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 26, animation: 'fadeUp .2s ease both' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Match {match.matchId}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Who won?</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{match.format}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: winner ? 0 : 18 }}>
          <TeamButton ids={match.teamA} side="A" winner={winner} onSelect={handleSelect} />
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 800, color: 'var(--fg-muted)', flexShrink: 0 }}>vs</div>
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
