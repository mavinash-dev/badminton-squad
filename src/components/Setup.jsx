import { useState } from 'react';
import { RacketSVG } from './Animations';

export default function Setup({ onGenerate }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [hours, setHours] = useState(1);
  const [names, setNames] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [swing, setSwing] = useState(false);

  const activePlayers = names.slice(0, playerCount);
  const canGenerate = activePlayers.every(n => n.trim().length > 0);

  function handleCountChange(n) {
    setPlayerCount(n);
    if (n === 3) setNames(prev => [prev[0], prev[1], prev[2], '']);
  }

  async function handleGenerate() {
    setSwing(true);
    setTimeout(() => setSwing(false), 400);
    setLoading(true);
    const players = activePlayers.map((name, i) => ({ id: `p${i + 1}`, name: name.trim() }));
    await onGenerate({ players, hours });
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>Session Setup</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 10, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em' }}>Players</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[3, 4].map(n => (
              <button
                key={n}
                onClick={() => handleCountChange(n)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid',
                  borderColor: playerCount === n ? 'var(--green)' : 'var(--border)',
                  background: playerCount === n ? 'var(--green-bg)' : 'transparent',
                  color: playerCount === n ? 'var(--green)' : 'var(--fg-muted)',
                  fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  transition: 'all .15s',
                  fontFamily: 'Inter',
                }}
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 10, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em' }}>Duration</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[1, 2].map(h => (
              <button
                key={h}
                onClick={() => setHours(h)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid',
                  borderColor: hours === h ? 'var(--green)' : 'var(--border)',
                  background: hours === h ? 'var(--green-bg)' : 'transparent',
                  color: hours === h ? 'var(--green)' : 'var(--fg-muted)',
                  fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  transition: 'all .15s',
                  fontFamily: 'Inter',
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em' }}>Player Names</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--fg-muted)', fontSize: 12, fontFamily: 'JetBrains Mono', minWidth: 20 }}>P{i + 1}</span>
              <input
                type="text"
                value={names[i]}
                onChange={e => {
                  const next = [...names];
                  next[i] = e.target.value;
                  setNames(next);
                }}
                placeholder={`Player ${i + 1} name`}
                style={{
                  flex: 1, background: 'var(--canvas)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px', color: 'var(--fg)',
                  fontSize: 15, fontFamily: 'Inter', outline: 'none',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}
        onClick={handleGenerate}
        disabled={!canGenerate || loading}
      >
        <RacketSVG swing={swing} />
        {loading ? 'Generating…' : 'Generate Schedule'}
      </button>

      <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
        {playerCount === 4
          ? `3 rotating 2v2 matchups · ${hours === 1 ? 'first to 21' : 'best of 3 sets'}`
          : `Handicap rotation (1 vs 2) · ${hours === 1 ? '2 rotations to 15' : '4 rotations to 21'}`}
      </p>
    </div>
  );
}
