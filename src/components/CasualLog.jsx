import { useState } from 'react';
import { SQUAD } from '../lib/players';

function Avatar({ player, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(player.id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        border: 'none', cursor: 'pointer', padding: '8px 12px',
        borderRadius: 14,
        outline: selected ? `2px solid ${player.color}` : '2px solid transparent',
        background: selected ? `${player.color}15` : 'transparent',
        transition: 'all .15s',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: player.color,
        color: player.textColor || '#f5f0e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 800,
        opacity: selected ? 1 : 0.45,
        transition: 'opacity .15s',
        border: selected ? `3px solid ${player.color}` : '3px solid transparent',
        boxShadow: selected ? `0 2px 10px ${player.color}40` : 'none',
      }}>
        {player.initials}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: selected ? 'var(--fg)' : 'var(--fg-muted)' }}>
        {player.name}
      </span>
    </button>
  );
}

export default function CasualLog({ date, onSave, onClose }) {
  const [selected, setSelected] = useState(SQUAD.map(p => p.id));
  const [note, setNote] = useState('');

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSave() {
    if (selected.length < 2) return;
    onSave({ type: 'casual', playerIds: selected, note, date });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(245,240,232,.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 28, animation: 'fadeUp .25s ease both' }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>🎾 Casual Play</div>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>
          {new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        <div className="section-label">Who played?</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
          {SQUAD.map(p => (
            <Avatar key={p.id} player={p} selected={selected.includes(p.id)} onToggle={toggle} />
          ))}
        </div>

        <div className="section-label" style={{ marginBottom: 8 }}>Note (optional)</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Played 2 hours, great rallies today..."
          rows={2}
          style={{
            width: '100%', background: 'var(--canvas)', border: '1.5px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', color: 'var(--fg)',
            fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none',
            resize: 'none', marginBottom: 20,
            transition: 'border-color .15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--green)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={selected.length < 2}>
            Save
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
