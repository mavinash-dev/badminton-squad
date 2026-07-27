import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { calcLeaderboard } from '../lib/tournament';
import { CrownSVG, ShieldSVG, DragonSVG, CrossedSwordsSVG, FlamesSVG } from './Icons';

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
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      background: 'var(--elevated)', border: '1.5px solid var(--border)',
      borderRadius: 14, padding: '12px 16px', flex: 1,
    }}>
      <div style={{ opacity: 0.5 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--fg)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
    </div>
  );
}

function ChampionCard({ player, wins, games }) {
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <div className="card mvp-card" style={{ flex: 1, textAlign: 'center', padding: '18px 10px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.8 }}>
        <CrownSVG size={22} color="var(--purple-mid)" />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: 10 }}>
        All-time Champion
      </div>
      <Avatar player={player} size={56} border={false} />
      <div style={{ fontWeight: 800, fontSize: 16, marginTop: 10, color: 'var(--fg)' }}>{player.name}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4, lineHeight: 1 }}>{winRate}%</div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 3 }}>{wins}W / {games}G</div>
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
      flex: 1, textAlign: 'center', padding: '18px 10px',
      background: 'linear-gradient(135deg, rgba(52,211,153,.05), rgba(124,58,237,.05))',
      borderColor: 'rgba(52,211,153,.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.7 }}>
        <ShieldSVG size={22} color="var(--green)" />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>
        Deadliest Pair
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        {players.map((p, i) => (
          <div key={p.id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
            <Avatar player={p} size={46} />
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--fg)' }}>{names}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4, lineHeight: 1 }}>{winRate}%</div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 3 }}>{wins}W / {games}G</div>
    </div>
  );
}

function SessionRow({ session, isLast }) {
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const players = (session.playerIds || []).map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const total = session.matches?.length || 0;
  const logged = session.matches?.filter(m => m.winner)?.length || 0;
  const done = logged === total && total > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: !isLast ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{ opacity: 0.4 }}>
        <CrossedSwordsSVG size={20} color="var(--fg-muted)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{date}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
          {session.type === 'casual' ? 'Casual' : 'Structured'} · {total} matches
          {!done && total > 0 ? ` · ${logged}/${total} logged` : ''}
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        {players.slice(0, 4).map((p, i) => (
          <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
            <Avatar player={p} size={26} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home({ history, loading, today, onNewSession, onCasual, onViewHistory, onViewLeaderboard }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <DragonSVG size={48} color="var(--green)" style={{ opacity: 0.4, margin: '0 auto 16px' }} />
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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 40px' }}>

      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28, paddingTop: 4 }}>
        <DragonSVG size={52} color="var(--green)" style={{ flexShrink: 0, marginTop: 2, opacity: 0.85 }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 5 }}>
            Badminton Squad
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--fg)', marginBottom: 5, letterSpacing: '-.3px', lineHeight: 1.2 }}>
            {noData ? 'The court of champions' : 'The war rages on'}
          </div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.5, fontStyle: noData ? 'italic' : 'normal' }}>
            {noData ? battleCry : tagline}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!noData && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatChip
            icon={<CrossedSwordsSVG size={18} color="var(--fg-muted)" />}
            label="Battles" value={totalSessions}
          />
          <StatChip
            icon={<FlamesSVG size={18} color="var(--fg-muted)" />}
            label="Matches" value={totalMatches}
          />
          <StatChip
            icon={<ShieldSVG size={18} color="var(--fg-muted)" />}
            label="Warriors" value={lb.filter(p => p.games > 0).length || SQUAD.length}
          />
        </div>
      )}

      {/* Champion + Pair */}
      {noData ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: 20, borderStyle: 'dashed' }}>
          <CrownSVG size={40} color="var(--fg-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--fg)', marginBottom: 8 }}>
            No champion yet
          </div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            The throne is unclaimed. The deadliest pair unknown.<br />
            Glory awaits those who step onto the court.
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => onNewSession(today)}>
            Start the First Battle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {topPlayer
            ? <ChampionCard player={SQUAD.find(p => p.id === topPlayer.id)} wins={topPlayer.wins} games={topPlayer.games} />
            : <div className="card" style={{ flex: 1, textAlign: 'center', padding: '20px', color: 'var(--fg-muted)', fontSize: 13 }}>
                <CrownSVG size={28} color="var(--fg-muted)" style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                Champion unclaimed
              </div>
          }
          {topDuo
            ? <DeadliestPairCard duoKey={topDuo.key} wins={topDuo.wins} games={topDuo.games} />
            : <div className="card" style={{ flex: 1, textAlign: 'center', padding: '20px', color: 'var(--fg-muted)', fontSize: 13 }}>
                <ShieldSVG size={28} color="var(--fg-muted)" style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                No alliance forged
              </div>
          }
        </div>
      )}

      {/* CTAs */}
      {!noData && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 15 }} onClick={() => onNewSession(today)}>
            New Battle
          </button>
          <button className="btn-secondary" style={{ flex: 1, fontSize: 15 }} onClick={() => onCasual(today)}>
            Casual Play
          </button>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Recent Battles</div>
          {sessions.slice(0, 4).map((s, i) => (
            <SessionRow key={s.id} session={s} isLast={i === Math.min(sessions.length, 4) - 1} />
          ))}
          {sessions.length > 4 && (
            <button className="btn-secondary" style={{ width: '100%', marginTop: 10, fontSize: 13 }} onClick={onViewHistory}>
              View all {sessions.length} battles
            </button>
          )}
        </div>
      )}

      {/* Bottom links */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13, gap: 7 }} onClick={onViewHistory}>
          <CrossedSwordsSVG size={15} color="var(--fg-muted)" /> War Records
        </button>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13, gap: 7 }} onClick={onViewLeaderboard}>
          <CrownSVG size={15} color="var(--fg-muted)" /> Hall of Fame
        </button>
      </div>
    </div>
  );
}
