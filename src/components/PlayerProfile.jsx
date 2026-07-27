import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { CrownIcon, ShieldIcon, CrossedAxesIcon, ScrollIcon } from './Icons';

function WinBar({ rate }) {
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${Math.round(rate * 100)}%`, background: 'var(--green-mid)', borderRadius: 3, transition: 'width .9s ease' }} />
    </div>
  );
}

export default function PlayerProfile({ playerId, history, onBack }) {
  const player = SQUAD.find(p => p.id === playerId);
  if (!player) return null;

  // Gather all sessions this player was part of
  const sessions = (history.sessions || []).filter(s => (s.playerIds || []).includes(playerId)).reverse();

  // All-time stats from history.players
  const record = (history.players || []).find(p => p.id === playerId) || { wins: 0, games: 0 };
  const winRate = record.games > 0 ? Math.round((record.wins / record.games) * 100) : 0;

  // Duo stats — all duos involving this player
  const duos = Object.entries(history.duos || {})
    .filter(([key]) => key.split('_').includes(playerId))
    .map(([key, v]) => {
      const partnerId = key.split('_').find(id => id !== playerId);
      const partner = SQUAD.find(p => p.id === partnerId);
      return {
        key, partner, wins: v.wins, games: v.games,
        winRate: v.games > 0 ? v.wins / v.games : 0,
      };
    })
    .filter(d => d.partner)
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  // Per-session summary
  function sessionWins(session) {
    return (session.matches || []).filter(m => {
      if (!m.winner) return false;
      const team = m.winner === 'A' ? m.teamA : m.teamB;
      return team.includes(playerId);
    }).length;
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px 48px' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 22, padding: '0 4px', lineHeight: 1 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg-muted)' }}>Back</span>
      </div>

      {/* Hero */}
      <div className="card mvp-card" style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 16, overflow: 'hidden' }}>
        <Avatar player={player} size={80} border={false} />
        <div style={{ fontWeight: 800, fontSize: 24, marginTop: 14 }}>{player.name}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--green)', lineHeight: 1 }}>{winRate}%</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Win rate</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--fg)', lineHeight: 1 }}>{record.wins}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Wins</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--fg)', lineHeight: 1 }}>{record.games}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Matches</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--fg)', lineHeight: 1 }}>{sessions.length}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>Sessions</div>
          </div>
        </div>
      </div>

      {/* Duo records */}
      {duos.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShieldIcon size={16} color="var(--fg-muted)" style={{ opacity: 0.5 }} />
            <div className="section-label" style={{ margin: 0 }}>Pair Records</div>
          </div>
          {duos.map(d => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar player={d.partner} size={34} border={false} />
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
            const date = new Date(s.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
            const w = sessionWins(s);
            const total = (s.matches || []).filter(m => m.winner && (m.teamA.includes(playerId) || m.teamB.includes(playerId))).length;
            const isLast = i === sessions.length - 1;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: !isLast ? '1px solid var(--border)' : 'none' }}>
                <CrossedAxesIcon size={16} color="var(--fg-muted)" style={{ opacity: 0.3, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{date}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {s.type === 'casual' ? 'Casual' : 'Structured'} · {total} matches played
                  </div>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: 14,
                  color: w > total / 2 ? 'var(--green)' : w === 0 ? 'var(--red)' : 'var(--fg-muted)',
                }}>
                  {w}W / {total - w}L
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '32px', borderStyle: 'dashed' }}>
          <CrownIcon size={32} color="var(--fg-muted)" style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No sessions recorded yet</div>
        </div>
      )}
    </div>
  );
}
