import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { RacketSVG } from './Animations';
import { Avatar } from './Avatar';

function PlayerToggle({ player, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(player.id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px',
        borderRadius: 14,
        outline: selected ? `2px solid ${player.color}` : '2px solid transparent',
        backgroundColor: selected ? `${player.color}15` : 'transparent',
        transition: 'all .15s',
      }}
    >
      <div style={{
        opacity: selected ? 1 : 0.35,
        transition: 'opacity .15s',
        boxShadow: selected ? `0 3px 14px ${player.color}45` : 'none',
        borderRadius: '50%',
      }}>
        <Avatar player={player} size={52} border={false} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: selected ? 'var(--fg)' : 'var(--fg-muted)', transition: 'color .15s' }}>
        {player.name}
      </span>
    </button>
  );
}

export default function Setup({ date, onGenerate, onClose }) {
  const [selectedIds, setSelectedIds] = useState(SQUAD.map(p => p.id));
  const [hours, setHours] = useState(1);
  const [matchCount, setMatchCount] = useState(null); // null = auto (Grok decides)
  const [loading, setLoading] = useState(false);
  const [swing, setSwing] = useState(false);

  function toggle(id) {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev; // min 3
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 4) return prev; // max 4
      return [...prev, id];
    });
  }

  const players = SQUAD.filter(p => selectedIds.includes(p.id));
  const canGenerate = players.length >= 3;

  async function handleGenerate() {
    setSwing(true);
    setTimeout(() => setSwing(false), 400);
    setLoading(true);
    await onGenerate({ players, matchCount, hours, date });
    setLoading(false);
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28, animation: 'fadeUp .25s ease both' }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Match Session</div>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>{displayDate}</div>

        {/* Player selection */}
        <div className="section-label">Who's playing? (3 or 4)</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {SQUAD.map(p => (
            <PlayerToggle key={p.id} player={p} selected={selectedIds.includes(p.id)} onToggle={toggle} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center', marginBottom: 22 }}>
          {players.length} players — {players.length === 4 ? '2v2 rotating' : '1v2 handicap rotation'}
        </p>

        {/* Duration */}
        <div className="section-label">How long are you playing?</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[1, 2].map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 12, border: '1.5px solid',
                borderColor: hours === h ? 'var(--green)' : 'var(--border)',
                background: hours === h ? 'var(--green-bg)' : 'var(--elevated)',
                color: hours === h ? 'var(--green)' : 'var(--fg-muted)',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                transition: 'all .15s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {h}h
            </button>
          ))}
        </div>

        {/* Match count */}
        <div className="section-label">Matches? <span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>(optional — Auto uses hours)</span></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[null, ...(players.length === 4 ? [3,4,5,6] : [3,4,5,6,7,8,9])].map(n => (
            <button
              key={n ?? 'auto'}
              onClick={() => setMatchCount(n)}
              style={{
                flex: 1, minWidth: 52, padding: '10px 0', borderRadius: 12, border: '1.5px solid',
                borderColor: matchCount === n ? 'var(--green)' : 'var(--border)',
                background: matchCount === n ? 'var(--green-bg)' : 'var(--elevated)',
                color: matchCount === n ? 'var(--green)' : 'var(--fg-muted)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all .15s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {n ?? 'Auto'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
          >
            <RacketSVG swing={swing} />
            {loading ? 'Generating…' : 'Generate Schedule'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
