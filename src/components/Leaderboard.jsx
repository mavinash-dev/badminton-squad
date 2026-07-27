import { useEffect, useState } from 'react';
import { readHistory } from '../lib/github';
import { calcLeaderboard } from '../lib/tournament';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';

function WinBar({ rate }) {
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
      <div style={{
        height: '100%',
        width: `${Math.round(rate * 100)}%`,
        background: 'var(--green-mid)',
        borderRadius: 3,
        transition: 'width .9s ease',
      }} />
    </div>
  );
}

export default function Leaderboard({ onBack, onPlayerClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    readHistory()
      .then(({ data: h }) => setData(calcLeaderboard(h)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--fg-muted)', fontSize: 15 }}>
      Loading…
    </div>
  );
  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--red)', fontSize: 14 }}>{error}</div>
  );

  const { players, duos } = data;

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 22, flex: 1 }}>Leaderboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dot-live" />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>All-time</span>
        </div>
      </div>

      {/* Players */}
      <div className="section-label" style={{ marginBottom: 12 }}>Best Player</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {players.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px', borderStyle: 'dashed' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚔️</div>
            <div style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>The throne is unclaimed</div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>No battles fought yet. Step onto the court.</div>
          </div>
        )}
        {players.map((p, i) => {
          const squad = SQUAD.find(q => q.id === p.id);
          const isMvp = i === 0 && p.games > 0;
          return (
            <div
              key={p.id}
              className={`card ${isMvp ? 'mvp-card' : ''}`}
              style={{ animationDelay: `${i * 70}ms`, cursor: onPlayerClick ? 'pointer' : 'default' }}
              onClick={() => onPlayerClick?.(p.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: isMvp ? 24 : 16, minWidth: 28 }}>
                  {['🥇','🥈','🥉'][i] || `#${i+1}`}
                </span>
                {squad && <Avatar player={squad} size={42} border={false} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <WinBar rate={p.winRate} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 16 }}>
                    {Math.round(p.winRate * 100)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{p.wins}W / {p.games}G</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Duos */}
      <div className="section-label" style={{ marginBottom: 12 }}>Best Duo</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {duos.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '20px', borderStyle: 'dashed' }}>
            <div style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>🛡️ No duo has risen yet</div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Alliances are forged in battle, not in waiting.</div>
          </div>
        )}
        {duos.slice(0, 6).map((d, i) => {
          const ids = d.key.split('_');
          const names = ids.map(id => SQUAD.find(p => p.id === id)?.name || id);
          const colors = ids.map(id => SQUAD.find(p => p.id === id)?.color || 'var(--green)');
          return (
            <div key={d.key} className="card" style={{ animationDelay: `${i * 70}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--fg-muted)', fontSize: 13, minWidth: 22 }}>#{i+1}</span>
                <div style={{ display: 'flex', marginRight: 4 }}>
                  {ids.map((id, j) => {
                    const sq = SQUAD.find(p => p.id === id);
                    return sq ? (
                      <div key={id} style={{ marginLeft: j > 0 ? -8 : 0 }}>
                        <Avatar player={sq} size={32} />
                      </div>
                    ) : null;
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{names.join(' & ')}</div>
                  <WinBar rate={d.winRate} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--green)' }}>{Math.round(d.winRate * 100)}%</div>
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
