import { useState } from 'react';
import { SQUAD } from '../lib/players';

export function Avatar({ player, size = 36, border = true }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = player.photo && !imgFailed;

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      border: border ? `1.5px solid var(--border)` : 'none',
      background: player.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 4px rgba(44,36,22,.15)',
    }}>
      {showPhoto ? (
        <img
          src={player.photo}
          alt={player.name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span style={{
          fontSize: size * 0.33, fontWeight: 800,
          color: player.textColor || '#f5f0e8',
          userSelect: 'none',
        }}>
          {player.initials}
        </span>
      )}
    </div>
  );
}

// Stacked avatars for a team
export function TeamAvatars({ ids, size = 30 }) {
  return (
    <div style={{ display: 'flex' }}>
      {ids.map((id, i) => {
        const p = SQUAD.find(q => q.id === id);
        if (!p) return null;
        return (
          <div key={id} style={{ marginLeft: i > 0 ? -(size * 0.28) : 0 }}>
            <Avatar player={p} size={size} />
          </div>
        );
      })}
    </div>
  );
}

// Name + avatar pill for a player
export function PlayerPill({ id, highlight = false }) {
  const p = SQUAD.find(q => q.id === id);
  if (!p) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: highlight ? `${p.color}18` : 'var(--elevated)',
      border: `1.5px solid ${highlight ? p.color + '50' : 'var(--border)'}`,
      borderRadius: 10, padding: '5px 10px 5px 5px',
    }}>
      <Avatar player={p} size={22} border={false} />
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? p.color : 'var(--fg-body)' }}>
        {p.name}
      </span>
    </div>
  );
}
