import { useState, useEffect, useRef } from 'react';
import { calcSessionLeaderboard, mergeSessionIntoHistory } from '../lib/tournament';
import { generateSummary } from '../lib/grok';
import { readHistory, writeHistory } from '../lib/github';
import { SQUAD } from '../lib/players';
import { Avatar, TeamAvatars } from './Avatar';
import { RacketSVG, Confetti } from './Animations';

export default function Results({ players, matches, date, sessionType = 'structured', onSaved, onBack }) {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [swing, setSwing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Fire confetti once on mount — this is the celebration moment
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const { wins, mvp, bestDuo, mvpTied, duoTied } = calcSessionLeaderboard(players, matches);
  const sorted = [...players].sort((a, b) => (wins[b.id] || 0) - (wins[a.id] || 0));

  const medals = ['🥇', '🥈', '🥉'];
  const mvpPlayer = mvp ? SQUAD.find(p => p.id === mvp) : null;

  function duoNames(key) {
    if (!key) return '—';
    return key.split('_').map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  }

  async function handleSummary() {
    setLoadingSummary(true);
    try {
      const text = await generateSummary({ players, matches, sessionLeaderboard: { mvp, bestDuo } });
      setSummary(text);
    } catch {
      setSummary('Grok was too tired to commentate today.');
    }
    setLoadingSummary(false);
  }

  async function handleSave() {
    setSwing(true);
    setTimeout(() => setSwing(false), 400);
    setSaving(true);
    setError('');
    try {
      const { data: history, sha } = await readHistory();
      const sessionId = `s_${date.replace(/-/g, '')}_${String(history.sessions.length + 1).padStart(3, '0')}`;
      const session = {
        id: sessionId, date, type: sessionType,
        duration: matches[0]?.format?.toLowerCase().includes('set') ? 2 : 1,
        playerCount: players.length,
        playerIds: players.map(p => p.id),
        matches,
        sessionLeaderboard: { mvp, bestDuo },
        aiSummary: summary,
      };
      const updated = mergeSessionIntoHistory(history, session, players, matches);
      await writeHistory(updated, sha, date);
      setSaved(true);
      setTimeout(() => onSaved(), 1400);
    } catch (e) {
      setError(`Save failed: ${e.message}`);
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', position: 'relative' }}>
      {showConfetti && <Confetti />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          {sessionType === 'casual' ? '🎾 Casual Play Results' : '🏸 Session Results'}
        </div>
      </div>

      {/* MVP hero */}
      {mvpPlayer ? (
        <div className="card" style={{
          marginBottom: 14, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(45,106,79,.07), rgba(233,196,106,.07))',
          borderColor: 'rgba(233,196,106,.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            🏆 MVP
          </div>
          <Avatar player={mvpPlayer} size={72} border={false} />
          <div style={{ fontWeight: 800, fontSize: 20, marginTop: 10, color: 'var(--green)' }}>{mvpPlayer.name}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2 }}>
            {wins[mvp] || 0} wins this session
          </div>
        </div>
      ) : mvpTied && (
        <div className="card" style={{ marginBottom: 14, textAlign: 'center', borderColor: 'var(--border-hi)' }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🤝</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>It's a tie!</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>No MVP this session — everyone's equal</div>
        </div>
      )}

      {/* Scores */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-label">All Players</div>
        {sorted.map((p, i) => {
          const squad = SQUAD.find(q => q.id === p.id);
          if (!squad) return null;
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 16, minWidth: 22 }}>{medals[i] || `#${i+1}`}</span>
              <Avatar player={squad} size={36} border={false} />
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{p.name}</span>
              <span style={{
                background: wins[p.id] ? 'var(--green-bg)' : 'rgba(138,122,101,.08)',
                color: wins[p.id] ? 'var(--green)' : 'var(--fg-muted)',
                border: `1.5px solid ${wins[p.id] ? 'rgba(45,106,79,.25)' : 'transparent'}`,
                borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700,
              }}>{wins[p.id] || 0}W</span>
            </div>
          );
        })}
      </div>

      {/* Best duo */}
      {bestDuo ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Best Duo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TeamAvatars ids={bestDuo.split('_')} size={34} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>{duoNames(bestDuo)}</span>
          </div>
        </div>
      ) : duoTied && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>Best Duo</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Tied — no clear winners today</div>
        </div>
      )}

      {/* AI Summary */}
      {!summary ? (
        <button
          className="btn-secondary"
          style={{ width: '100%', marginBottom: 14, padding: '12px', fontSize: 14 }}
          onClick={handleSummary}
          disabled={loadingSummary}
        >
          {loadingSummary ? 'Generating commentary…' : '✨ Generate AI Summary'}
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 14, background: 'rgba(45,106,79,.05)', borderColor: 'rgba(45,106,79,.2)' }}>
          <div className="section-label" style={{ color: 'var(--green)', marginBottom: 8 }}>AI Commentary</div>
          <p style={{ color: 'var(--fg-body)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{summary}</p>
        </div>
      )}

      {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</p>}

      {saved ? (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 800, fontSize: 16, padding: '16px 0' }}>
          ✓ Session saved!
        </div>
      ) : (
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}
          onClick={handleSave}
          disabled={saving}
        >
          <RacketSVG swing={swing} />
          {saving ? 'Saving…' : 'Save Session'}
        </button>
      )}
    </div>
  );
}
