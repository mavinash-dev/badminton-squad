import { useState } from 'react';
import { calcSessionLeaderboard, playerName, duoKey } from '../lib/tournament';
import { generateSummary } from '../lib/grok';
import { readHistory, writeHistory } from '../lib/github';
import { mergeSessionIntoHistory } from '../lib/tournament';
import { RacketSVG } from './Animations';

export default function Results({ players, matches, onSaved }) {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [swing, setSwing] = useState(false);

  const { wins, mvp, bestDuo } = calcSessionLeaderboard(players, matches);

  const sortedPlayers = [...players].sort((a, b) => (wins[b.id] || 0) - (wins[a.id] || 0));

  async function handleSummary() {
    setLoadingSummary(true);
    try {
      const text = await generateSummary({ players, matches, sessionLeaderboard: { mvp, bestDuo } });
      setSummary(text);
    } catch (e) {
      setSummary('Could not generate summary — Grok API unavailable.');
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
      const today = new Date().toISOString().slice(0, 10);
      const sessionId = `s_${today.replace(/-/g, '')}_${String(history.sessions.length + 1).padStart(3, '0')}`;

      const session = {
        id: sessionId,
        date: today,
        duration: matches[0]?.format?.includes('set') ? 2 : 1,
        playerCount: players.length,
        matches,
        sessionLeaderboard: { mvp, bestDuo },
        aiSummary: summary,
      };

      const updated = mergeSessionIntoHistory(history, session, players, matches);
      await writeHistory(updated, sha, today);
      setSaved(true);
      setTimeout(() => onSaved(), 1500);
    } catch (e) {
      setError(`Save failed: ${e.message}`);
    }
    setSaving(false);
  }

  const duoNames = bestDuo
    ? bestDuo.split('_').map(id => playerName(id, players)).join(' & ')
    : '—';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>Session Results</div>

      {/* Player scores */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>
          Session Wins
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--fg-muted)', fontSize: 12, fontFamily: 'JetBrains Mono', minWidth: 20 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
              <span style={{
                background: 'var(--green-bg)', color: 'var(--green)',
                borderRadius: 6, padding: '3px 10px',
                fontSize: 13, fontWeight: 700,
                fontFamily: 'JetBrains Mono',
              }}>
                {wins[p.id] || 0}W
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Session highlights */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>MVP</div>
            <div style={{ fontWeight: 700, color: 'var(--green)' }}>{playerName(mvp, players)}</div>
          </div>
          {bestDuo && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Best Duo</div>
              <div style={{ fontWeight: 700, color: 'var(--fg)' }}>{duoNames}</div>
            </div>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {!summary ? (
        <button
          className="btn-secondary"
          style={{ width: '100%', marginBottom: 16, padding: '12px' }}
          onClick={handleSummary}
          disabled={loadingSummary}
        >
          {loadingSummary ? 'Generating commentary…' : '✨ Generate AI Summary'}
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 16, background: 'var(--green-bg)', borderColor: 'rgba(28,231,131,0.2)' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10 }}>AI Commentary</div>
          <p style={{ color: 'var(--fg-body)', fontSize: 15, lineHeight: 1.6 }}>{summary}</p>
        </div>
      )}

      {error && (
        <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>
      )}

      {saved ? (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 16, padding: '16px 0' }}>
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
