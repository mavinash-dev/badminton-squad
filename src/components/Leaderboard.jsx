import { useEffect, useState } from 'react';
import { readHistory } from '../lib/github';
import { calcLeaderboard } from '../lib/tournament';

function WinRateBar({ rate }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%',
        width: `${Math.round(rate * 100)}%`,
        background: 'var(--green)',
        borderRadius: 2,
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    readHistory()
      .then(({ data: history }) => setData(calcLeaderboard(history)))
      .catch(e => setError(`Could not load history: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--fg-muted)' }}>
      Loading leaderboard…
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: '#ff6b6b', fontSize: 14 }}>{error}</div>
  );

  const { players, duos } = data;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
      {/* Players */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="eyebrow" style={{ flex: 1 }}>Best Single Player</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dot-live" />
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--fg-muted)' }}>All-time</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {players.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
            No sessions recorded yet.
          </div>
        )}
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`card ${i === 0 && p.games > 0 ? 'mvp-shimmer' : ''}`}
            style={{
              animationDelay: `calc(${i} * 80ms)`,
              borderColor: i === 0 && p.games > 0 ? 'rgba(255,215,0,0.4)' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: i === 0 ? 24 : 18 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                <WinRateBar rate={p.winRate} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--green)', fontWeight: 700 }}>
                  {Math.round(p.winRate * 100)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{p.wins}W / {p.games}G</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Duos */}
      <div className="eyebrow" style={{ marginBottom: 20 }}>Best Duo</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {duos.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
            No duo stats yet.
          </div>
        )}
        {duos.slice(0, 6).map((d, i) => {
          const ids = d.key.split('_');
          const names = ids.map(id => players.find(p => p.id === id)?.name || id);
          return (
            <div
              key={d.key}
              className="card"
              style={{ animationDelay: `calc(${i} * 80ms)` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 15, color: 'var(--fg-muted)' }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{names.join(' & ')}</div>
                  <WinRateBar rate={d.winRate} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--green)', fontWeight: 700 }}>
                    {Math.round(d.winRate * 100)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{d.wins}W / {d.games}G</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
