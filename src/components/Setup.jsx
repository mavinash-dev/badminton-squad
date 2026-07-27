import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { RacketSVG } from './Animations';
import { Avatar } from './Avatar';
import { CrossedAxesIcon } from './Icons';
import DatePicker from './DatePicker';
import { todayIST, offsetIST, formatDisplayIST } from '../lib/date';

function PlayerToggle({ player, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(player.id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '8px 10px', borderRadius: 12,
        opacity: selected ? 1 : 0.22,
        transition: 'opacity .15s',
      }}
    >
      <Avatar player={player} size={56} border={false} />
    </button>
  );
}

export default function Setup({ onGenerate, onClose }) {
  const [selectedDate, setSelectedDate] = useState(todayIST());
  const [showCal, setShowCal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(SQUAD.map(p => p.id));
  const [matchCount, setMatchCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [swing, setSwing] = useState(false);

  const today = todayIST();
  const tomorrow = offsetIST(1);

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
      if (prev.length !== next.length) setMatchCount(6);
      return next;
    });
  }

  const players = SQUAD.filter(p => selectedIds.includes(p.id));
  const n = players.length;
  const canGenerate = n >= 3;

  const matchOptions = [6, 9, 12, 15];

  async function handleGenerate() {
    setSwing(true);
    setTimeout(() => setSwing(false), 400);
    setLoading(true);
    await onGenerate({ players, matchCount, date: selectedDate });
    setLoading(false);
  }

  const dateLabel = selectedDate === today ? 'Today'
    : selectedDate === tomorrow ? 'Tomorrow'
    : formatDisplayIST(selectedDate);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.92)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 50, padding: '16px', backdropFilter: 'blur(8px)', overflowY: 'auto',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '26px 22px', animation: 'fadeUp .25s ease both', marginTop: 20 }}>

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[{ label: 'Today', v: today }, { label: 'Tomorrow', v: tomorrow }].map(({ label, v }) => (
            <button
              key={v}
              onClick={() => { setSelectedDate(v); setShowCal(false); }}
              style={{
                padding: '8px 18px', borderRadius: 10, border: '1.5px solid',
                borderColor: selectedDate === v && !showCal ? 'var(--green)' : 'var(--border)',
                background: selectedDate === v && !showCal ? 'var(--green-bg)' : 'var(--elevated)',
                color: selectedDate === v && !showCal ? 'var(--green)' : 'var(--fg-muted)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'all .15s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowCal(c => !c)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid',
              borderColor: showCal || (selectedDate !== today && selectedDate !== tomorrow) ? 'var(--green)' : 'var(--border)',
              background: showCal || (selectedDate !== today && selectedDate !== tomorrow) ? 'var(--green-bg)' : 'var(--elevated)',
              color: showCal || (selectedDate !== today && selectedDate !== tomorrow) ? 'var(--green)' : 'var(--fg-muted)',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all .15s', fontFamily: 'Inter, sans-serif',
            }}
          >
            {selectedDate !== today && selectedDate !== tomorrow ? dateLabel : 'Pick date'}
          </button>
        </div>

        {showCal && (
          <div style={{ background: 'var(--canvas)', borderRadius: 12, padding: '14px 12px', marginBottom: 14 }}>
            <DatePicker
              value={selectedDate}
              onChange={d => { setSelectedDate(d); setShowCal(false); }}
            />
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 22 }}>
          {formatDisplayIST(selectedDate)}
        </div>

        {/* Players */}
        <div className="section-label">Who's playing? (3 or 4)</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {SQUAD.map(p => (
            <PlayerToggle key={p.id} player={p} selected={selectedIds.includes(p.id)} onToggle={toggle} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center', marginBottom: 22 }}>
          {n >= 3
            ? `${n} players — ${n === 4 ? '2v2 rotating' : '1v2 handicap'}`
            : <span style={{ color: 'var(--red)' }}>Select at least 3 players</span>
          }
        </p>

        {canGenerate && (
          <>
            <div className="section-label" style={{ marginBottom: 8 }}>How many matches?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
              {matchOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setMatchCount(opt)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, border: '1.5px solid',
                    borderColor: matchCount === opt ? 'var(--green)' : 'var(--border)',
                    background: matchCount === opt ? 'var(--green-bg)' : 'var(--elevated)',
                    color: matchCount === opt ? 'var(--green)' : 'var(--fg-muted)',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    transition: 'all .15s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {opt}
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
            <CrossedAxesIcon size={17} color="#07070d" />
            {loading ? 'Generating…' : 'Generate Schedule'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
