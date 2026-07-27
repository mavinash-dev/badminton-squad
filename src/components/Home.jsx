import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { calcLeaderboard } from '../lib/tournament';
import { CrownIcon, ShieldIcon, CrossedAxesIcon, FlameIcon, ThroneIcon } from './Icons';

const BATTLE_CRIES = [
  'The throne is empty. No blood has been spilled yet.',
  'The court awaits its first conqueror. Who dares?',
  'Before kings were crowned, there was silence. End it.',
  "Winter is coming. And so is a smash you won't forget.",
  'The ravens have not yet flown. Start the war.',
];

const TAGLINES = [
  'Blood, sweat, and shuttlecocks.',
  'Every match, a new battle.',
  'The court remembers everything.',
  'No mercy. No retirement.',
  'Alliances forged. Rivalries born.',
];

function StatChip({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: 'var(--elevated)', border: '1.5px solid var(--border)',
      borderRadius: 16, padding: '14px 10px', flex: 1,
    }}>
      <div style={{ opacity: 0.4 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--fg)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div>
    </div>
  );
}

function ChampionCard({ player, wins, games }) {
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <div className="card mvp-card" style={{ flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 12px' }}>
        <CrownIcon size={22} color="var(--purple-mid)" />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--purple-mid)', margin: '10px 0 14px' }}>
          All-time Champion
        </div>
        <Avatar player={player} size={60} border={false} />
        <div style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>{player.name}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', marginTop: 6, lineHeight: 1 }}>{winRate}%</div>
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 5 }}>{wins}W / {games}G</div>
      </div>
    </div>
  );
}

function DeadliestPairCard({ duoKey, wins, games }) {
  const ids = duoKey.split('_');
  const players = ids.map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const names = players.map(p => p.name).join(' & ');
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <div className="card" style={{
      flex: 1,
      background: 'linear-gradient(135deg, rgba(52,211,153,.05), rgba(124,58,237,.05))',
      borderColor: 'rgba(52,211,153,.18)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 12px' }}>
        <ShieldIcon size={22} color="var(--green)" />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green)', margin: '10px 0 14px' }}>
          Deadliest Pair
        </div>
        <div style={{ display: 'flex', marginBottom: 12 }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
              <Avatar player={p} size={46} />
            </div>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{names}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', marginTop: 6, lineHeight: 1 }}>{winRate}%</div>
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 5 }}>{wins}W / {games}G</div>
      </div>
    </div>
  );
}

function SessionRow({ session, isLast }) {
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
  });
  const players = (session.playerIds || []).map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const total = session.matches?.length || 0;
  const logged = session.matches?.filter(m => m.winner)?.length || 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
      borderBottom: !isLast ? '1px solid var(--border)' : 'none',
    }}>
      <CrossedAxesIcon size={18} color="var(--fg-muted)" style={{ opacity: 0.3, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{date}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>
          {session.type === 'casual' ? 'Casual' : 'Structured'} · {total} matches
          {logged < total && total > 0 ? ` · ${logged}/${total} logged` : ''}
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        {players.slice(0, 4).map((p, i) => (
          <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
            <Avatar player={p} size={28} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home({ history, loading, onNewSession, onCasual, onViewHistory, onViewLeaderboard, onPlayerClick }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 16px' }}>
        <ThroneIcon size={48} color="var(--green)" style={{ margin: '0 auto 20px', opacity: 0.3 }} />
        <div style={{ color: 'var(--fg-muted)', fontSize: 15 }}>Summoning the war records…</div>
      </div>
    );
  }

  const { players: lb, duos } = calcLeaderboard(history);
  const sessions = [...(history.sessions || [])].reverse();
  const totalSessions = sessions.length;
  const totalMatches = sessions.reduce((sum, s) => sum + (s.matches?.filter(m => m.winner)?.length || 0), 0);

  const topPlayer = lb.find(p => p.games > 0);
  const topDuo = duos.find(d => d.games > 0);
  const noData = totalSessions === 0;

  const battleCry = BATTLE_CRIES[Math.floor(Math.random() * BATTLE_CRIES.length)];
  const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 64px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 32, paddingTop: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--fg)', marginBottom: 10, letterSpacing: '-.5px', lineHeight: 1.2 }}>
          {noData ? 'The court of champions' : 'The war rages on'}
        </div>
        <div style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.7, fontStyle: noData ? 'italic' : 'normal' }}>
          {noData ? battleCry : tagline}
        </div>
      </div>

      {/* Stats row */}
      {!noData && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <StatChip icon={<CrossedAxesIcon size={20} color="var(--fg-muted)" />} label="Battles" value={totalSessions} />
          <StatChip icon={<FlameIcon size={20} color="var(--fg-muted)" />} label="Matches" value={totalMatches} />
          <StatChip icon={<ShieldIcon size={20} color="var(--fg-muted)" />} label="Warriors" value={lb.filter(p => p.games > 0).length || SQUAD.length} />
        </div>
      )}

      {/* Champion + Pair */}
      {noData ? (
        <div className="card" style={{ textAlign: 'center', padding: '52px 28px', marginBottom: 28, borderStyle: 'dashed' }}>
          <ThroneIcon size={48} color="var(--fg-muted)" style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>No champion yet</div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
            The throne is unclaimed. The deadliest pair unknown.<br />
            Glory awaits those who step onto the court.
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center', margin: '0 auto' }} onClick={onNewSession}>
            Start the First Battle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          {topPlayer
            ? <div onClick={() => onPlayerClick?.(topPlayer.id)} style={{ flex: 1, cursor: 'pointer' }}>
                <ChampionCard player={SQUAD.find(p => p.id === topPlayer.id)} wins={topPlayer.wins} games={topPlayer.games} />
              </div>
            : <div className="card" style={{ flex: 1, textAlign: 'center', padding: '28px 14px' }}>
                <ThroneIcon size={28} color="var(--fg-muted)" style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Throne unclaimed</div>
              </div>
          }
          {topDuo
            ? <DeadliestPairCard duoKey={topDuo.key} wins={topDuo.wins} games={topDuo.games} />
            : <div className="card" style={{ flex: 1, textAlign: 'center', padding: '28px 14px' }}>
                <ShieldIcon size={28} color="var(--fg-muted)" style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>No alliance yet</div>
              </div>
          }
        </div>
      )}

      {/* CTAs */}
      {!noData && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 15, padding: '14px 0' }} onClick={onNewSession}>
            New Battle
          </button>
          <button className="btn-secondary" style={{ flex: 1, fontSize: 15, justifyContent: 'center' }} onClick={onCasual}>
            Casual Play
          </button>
        </div>
      )}

      {/* Squad — always visible so anyone can tap their own profile */}
      <div className="card" style={{ marginBottom: 20, padding: '20px 20px 16px' }}>
        <div className="section-label" style={{ marginBottom: 18 }}>The Squad</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {SQUAD.map(p => {
            const rec = (history.players || []).find(r => r.id === p.id);
            const winRate = rec && rec.games > 0 ? Math.round((rec.wins / rec.games) * 100) : null;
            return (
              <button
                key={p.id}
                onClick={() => onPlayerClick?.(p.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 12 }}
              >
                <Avatar player={p} size={56} border={false} />
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: winRate !== null ? 'var(--green)' : 'var(--fg-muted)', fontWeight: 600 }}>
                  {winRate !== null ? `${winRate}%` : '—'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: '20px 20px 8px' }}>
          <div className="section-label" style={{ marginBottom: 6 }}>Recent Battles</div>
          {sessions.slice(0, 4).map((s, i) => (
            <SessionRow key={s.id} session={s} isLast={i === Math.min(sessions.length, 4) - 1} />
          ))}
          {sessions.length > 4 && (
            <button className="btn-secondary" style={{ width: '100%', marginTop: 12, fontSize: 13, justifyContent: 'center' }} onClick={onViewHistory}>
              View all {sessions.length} battles
            </button>
          )}
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13, justifyContent: 'center' }} onClick={onViewHistory}>
          War Records
        </button>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13, justifyContent: 'center' }} onClick={onViewLeaderboard}>
          Hall of Fame
        </button>
      </div>
    </div>
  );
}
