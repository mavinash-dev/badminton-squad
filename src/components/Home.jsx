import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { calcLeaderboard } from '../lib/tournament';

const BATTLE_CRIES = [
  'The throne is empty. No blood has been spilled… yet.',
  'The court awaits its first conqueror. Who dares?',
  'Before kings were crowned, there was silence. End it.',
  "Winter is coming. And so is a smash you won't forget.",
  'The ravens have not yet flown. Start the war.',
];

const TAGLINES = [
  'The war rages on.',
  'Blood, sweat, and shuttlecocks.',
  'Every match, a new battle.',
  'The court remembers everything.',
  'No mercy. No retirement.',
];

function StatChip({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'var(--elevated)', border: '1.5px solid var(--border)',
      borderRadius: 14, padding: '12px 20px', flex: 1,
    }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--fg)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
    </div>
  );
}

function MVPCard({ player, wins, games }) {
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <div className="card mvp-card" style={{ flex: 1, textAlign: 'center', padding: '18px 12px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: 10 }}>
        ⚔️ All-time Champion
      </div>
      <Avatar player={player} size={60} border={false} />
      <div style={{ fontWeight: 800, fontSize: 17, marginTop: 10, color: 'var(--fg)' }}>{player.name}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>{winRate}%</div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{wins}W / {games}G</div>
    </div>
  );
}

function DuoCard({ duoKey, wins, games }) {
  const ids = duoKey.split('_');
  const players = ids.map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const names = players.map(p => p.name).join(' & ');
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <div className="card" style={{
      flex: 1, textAlign: 'center', padding: '18px 12px',
      background: 'linear-gradient(135deg, rgba(52,211,153,.05), rgba(124,58,237,.05))',
      borderColor: 'rgba(52,211,153,.15)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>
        🛡️ Deadliest Pair
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        {players.map((p, i) => (
          <div key={p.id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
            <Avatar player={p} size={48} />
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--fg)' }}>{names}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>{winRate}%</div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{wins}W / {games}G</div>
    </div>
  );
}

function SessionRow({ session, index }) {
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const players = (session.playerIds || []).map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const matchCount = session.matches?.length || 0;
  const loggedCount = session.matches?.filter(m => m.winner)?.length || 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: index > 0 ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>{date}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
          {session.type === 'casual' ? '🎾 Casual' : '🏸 Structured'} · {matchCount} matches
          {loggedCount < matchCount ? ` · ${loggedCount}/${matchCount} logged` : ''}
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

export default function Home({ history, loading, today, onNewSession, onCasual, onViewHistory, onViewLeaderboard }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚔️</div>
        <div style={{ color: 'var(--fg-muted)', fontSize: 15 }}>Summoning the war records…</div>
      </div>
    );
  }

  const { players: lb, duos } = calcLeaderboard(history);
  const sessions = [...(history.sessions || [])].reverse(); // most recent first
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
      <div style={{ marginBottom: 28, paddingTop: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6 }}>
          Badminton Squad
        </div>
        {noData ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--fg)', marginBottom: 6, letterSpacing: '-.3px', lineHeight: 1.25 }}>
              ⚔️ The court of champions
            </div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>
              {battleCry}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--fg)', marginBottom: 6, letterSpacing: '-.3px' }}>
              ⚔️ The war rages on
            </div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>
              {tagline}
            </div>
          </>
        )}
      </div>

      {/* Stats row */}
      {!noData && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatChip label="Battles" value={totalSessions} />
          <StatChip label="Matches" value={totalMatches} />
          <StatChip label="Warriors" value={lb.filter(p => p.games > 0).length || SQUAD.length} />
        </div>
      )}

      {/* MVP + Duo */}
      {noData ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 20, borderStyle: 'dashed' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏰</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--fg)', marginBottom: 8 }}>
            No champion yet
          </div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            The throne is unclaimed. The best duo unknown.<br />
            Glory awaits those who step onto the court.
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => onNewSession(today)}>
            ⚔️ Start the First Battle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {topPlayer ? (
            <MVPCard
              player={SQUAD.find(p => p.id === topPlayer.id)}
              wins={topPlayer.wins}
              games={topPlayer.games}
            />
          ) : (
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '18px 12px', color: 'var(--fg-muted)', fontSize: 13 }}>
              ⚔️ Champion<br />unclaimed
            </div>
          )}
          {topDuo ? (
            <DuoCard duoKey={topDuo.key} wins={topDuo.wins} games={topDuo.games} />
          ) : (
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '18px 12px', color: 'var(--fg-muted)', fontSize: 13 }}>
              🛡️ Deadliest pair<br />unknown
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      {!noData && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 15 }} onClick={() => onNewSession(today)}>
            🏸 New Session
          </button>
          <button className="btn-secondary" style={{ flex: 1, fontSize: 15 }} onClick={() => onCasual(today)}>
            🎾 Casual Play
          </button>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Recent Battles</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sessions.slice(0, 4).map((s, i) => (
              <SessionRow key={s.id} session={s} index={i} />
            ))}
          </div>
          {sessions.length > 4 && (
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: 12, fontSize: 13 }}
              onClick={onViewHistory}
            >
              View all {sessions.length} sessions →
            </button>
          )}
        </div>
      )}

      {/* History + Leaderboard links */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={onViewHistory}>
          📅 Session History
        </button>
        <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={onViewLeaderboard}>
          🏆 Leaderboard
        </button>
      </div>
    </div>
  );
}
