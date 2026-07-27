import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { RacketSVG } from './Animations';
import { Avatar } from './Avatar';
import { CrossedAxesIcon } from './Icons';

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

function DateChip({ label, value, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        padding: '9px 16px', borderRadius: 10, border: '1.5px solid',
        borderColor: selected ? 'var(--green)' : 'var(--border)',
        background: selected ? 'var(--green-bg)' : 'var(--elevated)',
        color: selected ? 'var(--green)' : 'var(--fg-muted)',
        fontWeight: 700, fontSize: 13, cursor: 'pointer',
        transition: 'all .15s', fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  );
}

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
        opacity: selected ? 1 : 0.25,
        transition: 'opacity .15s',
        boxShadow: selected ? `0 0 0 2.5px ${player.color}, 0 4px 16px ${player.color}50` : 'none',
        borderRadius: '50%',
      }}>
        <Avatar player={player} size={54} border={false} />
      </div>
    </button>
  );
}

export default function Setup({ onGenerate, onClose }) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [customDate, setCustomDate] = useState('');
  const [selectedIds, setSelectedIds] = useState(SQUAD.map(p => p.id));
  const [hours, setHours] = useState(1);
  const [matchCount, setMatchCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swing, setSwing] = useState(false);

  function selectDate(d) {
    setSelectedDate(d);
    setCustomDate('');
  }

  function handleCustomDate(e) {
    const v = e.target.value;
    setCustomDate(v);
    if (v) setSelectedDate(v);
  }

  function toggle(id) {
    setSelectedIds(prev => {
      let next;
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev;
        next = prev.filter(x => x !== id);
      } else {
        if (prev.length >= 4) return prev;
        next = [...prev, id];
      }
      // reset matchCount if crossing the 3↔4 boundary
      const prevCount = prev.length;
      const nextCount = next.length;
      if ((prevCount === 4 && nextCount === 3) || (prevCount === 3 && nextCount === 4)) {
        setMatchCount(null);
      }
      return next;
    });
  }

  const players = SQUAD.filter(p => selectedIds.includes(p.id));
  const n = players.length;
  const canGenerate = n >= 3;
  const dateLabel = selectedDate === today ? 'Today' : selectedDate === tomorrow ? 'Tomorrow' : selectedDate;

  async function handleGenerate() {
    setSwing(true);
    setTimeout(() => setSwing(false), 400);
    setLoading(true);
    await onGenerate({ players, matchCount, hours, date: selectedDate });
    setLoading(false);
  }

  // 4p: 1h→3-6, 2h→4-8 | 3p: 1h→4-7, 2h→6-9
  const matchOptions = n === 4
    ? (hours === 2 ? [4, 5, 6, 7, 8] : [3, 4, 5, 6])
    : (hours === 2 ? [6, 7, 8, 9] : [3, 4, 5, 6, 7]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(8px)',
      overflowY: 'auto',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '28px 26px', animation: 'fadeUp .25s ease both', margin: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>New Battle</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>Set up today's match session</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 24, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>

        {/* Date */}
        <div className="section-label">When are you playing?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <DateChip label="Today" value={today} selected={selectedDate === today && !customDate} onSelect={selectDate} />
          <DateChip label="Tomorrow" value={tomorrow} selected={selectedDate === tomorrow && !customDate} onSelect={selectDate} />
          <div style={{ flex: 1, minWidth: 130 }}>
            <input
              type="date"
              value={customDate}
              onChange={handleCustomDate}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 10, border: '1.5px solid',
                borderColor: customDate ? 'var(--green)' : 'var(--border)',
                background: customDate ? 'var(--green-bg)' : 'var(--elevated)',
                color: customDate ? 'var(--green)' : 'var(--fg-muted)',
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                outline: 'none', boxSizing: 'border-box',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 22 }}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        {/* Players */}
        <div className="section-label">Who's playing? (3 or 4)</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {SQUAD.map(p => (
            <PlayerToggle key={p.id} player={p} selected={selectedIds.includes(p.id)} onToggle={toggle} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center', marginBottom: 22 }}>
          {n >= 3
            ? `${n} players — ${n === 4 ? '2v2 rotating' : '1v2 handicap rotation'}`
            : <span style={{ color: 'var(--red)' }}>Select at least 3 players</span>
          }
        </p>

        {/* Only show these when valid player count */}
        {canGenerate && (
          <>
            {/* Duration */}
            <div className="section-label">How long?</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[1, 2].map(h => (
                <button
                  key={h}
                  onClick={() => { setHours(h); setMatchCount(null); }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: '1.5px solid',
                    borderColor: hours === h ? 'var(--green)' : 'var(--border)',
                    background: hours === h ? 'var(--green-bg)' : 'var(--elevated)',
                    color: hours === h ? 'var(--green)' : 'var(--fg-muted)',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    transition: 'all .15s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {h} hour{h > 1 ? 's' : ''}
                </button>
              ))}
            </div>

            {/* Match count */}
            <div className="section-label" style={{ marginBottom: 8 }}>
              Matches{' '}
              <span style={{ fontWeight: 400, color: 'var(--fg-muted)', textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
                — Auto picks based on duration
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[null, ...matchOptions].map(n => (
                <button
                  key={n ?? 'auto'}
                  onClick={() => setMatchCount(n)}
                  style={{
                    flex: 1, minWidth: 46, padding: '9px 0', borderRadius: 10, border: '1.5px solid',
                    borderColor: matchCount === n ? 'var(--green)' : 'var(--border)',
                    background: matchCount === n ? 'var(--green-bg)' : 'var(--elevated)',
                    color: matchCount === n ? 'var(--green)' : 'var(--fg-muted)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'all .15s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {n ?? 'Auto'}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
          >
            <CrossedAxesIcon size={18} color="#07070d" />
            {loading ? 'Generating…' : 'Generate Schedule'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
