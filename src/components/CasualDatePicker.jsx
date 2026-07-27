import { useState } from 'react';
import { ScrollIcon } from './Icons';

const todayStr = new Date().toISOString().slice(0, 10);
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export default function CasualDatePicker({ onPick, onClose }) {
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState(todayStr);

  function pick(d) { setSelected(d); setCustom(''); }

  const chips = [
    { label: 'Yesterday', value: yesterdayStr },
    { label: 'Today', value: todayStr },
    { label: 'Tomorrow', value: tomorrowStr },
  ];

  const finalDate = custom || selected;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(8px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: '28px 26px', animation: 'fadeUp .2s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScrollIcon size={20} color="var(--green)" />
            <div style={{ fontWeight: 800, fontSize: 18 }}>Log Casual Play</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 22, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>

        <div className="section-label">When did you play?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {chips.map(c => (
            <button
              key={c.value}
              onClick={() => pick(c.value)}
              style={{
                flex: 1, padding: '9px 10px', borderRadius: 10, border: '1.5px solid',
                borderColor: selected === c.value && !custom ? 'var(--green)' : 'var(--border)',
                background: selected === c.value && !custom ? 'var(--green-bg)' : 'var(--elevated)',
                color: selected === c.value && !custom ? 'var(--green)' : 'var(--fg-muted)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'all .15s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={custom}
          onChange={e => { setCustom(e.target.value); if (e.target.value) setSelected(e.target.value); }}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid',
            borderColor: custom ? 'var(--green)' : 'var(--border)',
            background: custom ? 'var(--green-bg)' : 'var(--elevated)',
            color: custom ? 'var(--green)' : 'var(--fg-muted)',
            fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
            marginBottom: 24,
          }}
        />

        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 20, textAlign: 'center' }}>
          {new Date(finalDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onPick(finalDate)}
          >
            Log Matches →
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
