import { useState, useEffect } from 'react';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { CrownIcon, ShieldIcon, CrossedAxesIcon, ScrollIcon } from './Icons';
import { generatePlayerRoast } from '../lib/grok';

function WinBar({ rate }) {
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${Math.round(rate * 100)}%`, background: 'var(--green-mid)', borderRadius: 3, transition: 'width .9s ease' }} />
    </div>
  );
}

export default function PlayerProfile({ playerId, history, onBack }) {
  const [roast, setRoast] = useState(null);
  const [roastLoading, setRoastLoading] = useState(false);

  const player = SQUAD.find(p => p.id === playerId);
  if (!player) return null;

  const sessions = (history.sessions || []).filter(s => (s.playerIds || []).includes(playerId)).reverse();
  const record = (history.players || []).find(p => p.id === playerId) || { wins: 0, games: 0 };
  const winRate = record.games > 0 ? Math.round((record.wins / record.games) * 100) : 0;

  // Count MVP crowns across sessions
  const mvpCount = sessions.filter(s => s.sessionLeaderboard?.mvp === playerId).length;
  const isMvp = mvpCount > 0;

  // Duo stats
  const duos = Object.entries(history.duos || {})
    .filter(([key]) => key.split('_').includes(playerId))
    .map(([key, v]) => {
      const partnerId = key.split('_').find(id => id !== playerId);
      const partner = SQUAD.find(p => p.id === partnerId);
      return { key, partner, wins: v.wins, games: v.games, winRate: v.games > 0 ? v.wins / v.games : 0 };
    })
    .filter(d => d.partner && d.games > 0)
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  const bestPartner = duos[0]?.partner?.name || null;

  function sessionWins(session) {
    return (session.matches || []).filter(m => {
      if (!m.winner) return false;
      return (m.winner === 'A' ? m.teamA : m.teamB).includes(playerId);
    }).length;
  }

  useEffect(() => {
    if (record.games === 0) return;
    setRoastLoading(true);
    generatePlayerRoast({ player, winRate, wins: record.wins, games: record.games, sessions: sessions.length, mvpCount, bestPartner })
      .then(text => setRoast(text))
      .catch(() => setRoast(null))
      .finally(() => setRoastLoading(false));
  }, [playerId]);

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px 64px' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 22, padding: '0 4px', lineHeight: 1 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg-muted)' }}>Back</span>
      </div>

      {/* Hero */}
      <div className={`card ${isMvp ? 'mvp-card' : ''}`} style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
        {isMvp && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            <CrownIcon size={16} color="var(--purple-mid)" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--purple-mid)' }}>
              MVP · {mvpCount} time{mvpCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <Avatar player={player} size={80} border={false} />
        <div style={{ fontWeight: 800, fontSize: 24, marginTop: 14, color: 'var(--fg)' }}>{player.name}</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
          {[
            { val: `${winRate}%`, label: 'Win rate', color: 'var(--green)' },
            { val: record.wins, label: 'Wins' },
            { val: record.games, label: 'Matches' },
            { val: sessions.length, label: 'Sessions' },
          ].map(({ val, label, color }, i, arr) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 26, color: color || 'var(--fg)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 32, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Grok roast */}
        {record.games > 0 && (
          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: 'rgba(167,139,250,.06)', border: '1px solid rgba(167,139,250,.15)',
            borderRadius: 12, textAlign: 'left',
          }}>
            {roastLoading ? (
              <div style={{ fontSize: 13, color: 'var(--fg-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                Summoning the chronicles…
              </div>
            ) : roast ? (
              <div style={{ fontSize: 13, color: 'var(--fg-body)', lineHeight: 1.7 }}>{roast}</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Duo records */}
      {duos.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShieldIcon size={16} color="var(--fg-muted)" style={{ opacity: 0.5 }} />
            <div className="section-label" style={{ margin: 0 }}>Pair Records</div>
          </div>
          {duos.map((d, i) => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < duos.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <Avatar player={d.partner} size={36} border={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.partner.name}</div>
                <WinBar rate={d.winRate} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 15 }}>{Math.round(d.winRate * 100)}%</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{d.wins}W / {d.games}G</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ScrollIcon size={16} color="var(--fg-muted)" style={{ opacity: 0.5 }} />
            <div className="section-label" style={{ margin: 0 }}>Session History</div>
          </div>
          {sessions.map((s, i) => {
            const date = new Date(s.date + 'T12:00:00').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' });
            const w = sessionWins(s);
            const total = (s.matches || []).filter(m => m.winner && (m.teamA.includes(playerId) || m.teamB.includes(playerId))).length;
            const wasMvp = s.sessionLeaderboard?.mvp === playerId;
            const isLast = i === sessions.length - 1;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: !isLast ? '1px solid var(--border)' : 'none' }}>
                <CrossedAxesIcon size={16} color="var(--fg-muted)" style={{ opacity: 0.3, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{date}</span>
                    {wasMvp && <CrownIcon size={13} color="var(--purple-mid)" />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {s.type === 'casual' ? 'Casual' : 'Structured'} · {total} matches
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: w > total / 2 ? 'var(--green)' : w === 0 ? 'var(--red)' : 'var(--fg-muted)' }}>
                  {w}W / {total - w}L
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', borderStyle: 'dashed' }}>
          <CrownIcon size={32} color="var(--fg-muted)" style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No sessions recorded yet</div>
        </div>
      )}
    </div>
  );
}
