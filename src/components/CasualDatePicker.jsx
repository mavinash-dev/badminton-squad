import { useState } from 'react';
import { ScrollIcon } from './Icons';
import DatePicker from './DatePicker';
import { todayIST, offsetIST, formatDisplayIST } from '../lib/date';

export default function CasualDatePicker({ onPick, onClose }) {
  const [selected, setSelected] = useState(todayIST());

  const today = todayIST();
  const yesterday = offsetIST(-1);
  const tomorrow = offsetIST(1);

  const chips = [
    { label: 'Yesterday', value: yesterday },
    { label: 'Today',     value: today },
    { label: 'Tomorrow',  value: tomorrow },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(8px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: '26px 22px', animation: 'fadeUp .2s ease both' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScrollIcon size={18} color="var(--green)" />
            <span style={{ fontWeight: 800, fontSize: 17 }}>Log Casual Play</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {chips.map(c => (
            <button
              key={c.value}
              onClick={() => setSelected(c.value)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, border: '1.5px solid',
                borderColor: selected === c.value ? 'var(--green)' : 'var(--border)',
                background: selected === c.value ? 'var(--green-bg)' : 'var(--elevated)',
                color: selected === c.value ? 'var(--green)' : 'var(--fg-muted)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                transition: 'all .15s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Custom calendar */}
        <div style={{ background: 'var(--canvas)', borderRadius: 12, padding: '14px 12px', marginBottom: 18 }}>
          <DatePicker value={selected} onChange={setSelected} />
        </div>

        <div style={{ fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center', marginBottom: 18 }}>
          {formatDisplayIST(selected)}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onPick(selected)}>
            Log Matches →
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
