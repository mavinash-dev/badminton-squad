import { useState } from 'react';
import { calcSessionLeaderboard, mergeSessionIntoHistory } from '../lib/tournament';
import { generateSummary } from '../lib/grok';
import { readHistory, writeHistory } from '../lib/github';
import { SQUAD } from '../lib/players';
import { RacketSVG } from './Animations';

export default function Results({ players, matches, date, onSaved, onBack }) {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [swing, setSwing] = useState(false);

  const { wins, mvp, bestDuo } = calcSessionLeaderboard(players, matches);
  const sorted = [...players].sort((a, b) => (wins[b.id] || 0) - (wins[a.id] || 0));

  const medals = ['🥇', '🥈', '🥉'];

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
      const sessionPlayerIds = players.map(p => p.id);
      const session = {
        id: sessionId, date, type: 'structured',
        duration: matches[0]?.format?.toLowerCase().includes('set') ? 2 : 1,
        playerCount: players.length,
        playerIds: sessionPlayerIds,
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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Session Results</div>
      </div>

      {/* Scores */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-label">Session Wins</div>
        {sorted.map((p, i) => {
          const squad = SQUAD.find(q => q.id === p.id);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 16 }}>{medals[i] || `#${i+1}`}</span>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: squad?.color, color: squad?.textColor || '#f5f0e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>{squad?.initials}</div>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{p.name}</span>
              <span style={{
                background: 'var(--green-bg)', color: 'var(--green)',
                border: '1.5px solid rgba(45,106,79,.25)', borderRadius: 8,
                padding: '3px 10px', fontSize: 13, fontWeight: 700,
              }}>{wins[p.id] || 0}W</span>
            </div>
          );
        })}
      </div>

      {/* Highlights */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>MVP</div>
            <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 15 }}>
              {SQUAD.find(p => p.id === mvp)?.name || mvp}
            </div>
          </div>
          {bestDuo && (
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>Best Duo</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{duoNames(bestDuo)}</div>
            </div>
          )}
        </div>
      </div>

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
        <div className="card" style={{
          marginBottom: 16,
          background: 'rgba(45,106,79,.05)',
          borderColor: 'rgba(45,106,79,.2)',
        }}>
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
