import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { CrossedAxesIcon, ScrollIcon } from './Icons';

function MatchLine({ match }) {
  const teamA = (match.teamA || []).map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  const teamB = (match.teamB || []).map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  const winnerTeam = match.winner;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0' }}>
      <span style={{ color: winnerTeam === 'A' ? 'var(--green)' : 'var(--fg-muted)', fontWeight: winnerTeam === 'A' ? 700 : 400 }}>{teamA}</span>
      <span style={{ opacity: 0.3, fontSize: 10, flexShrink: 0 }}>vs</span>
      <span style={{ color: winnerTeam === 'B' ? 'var(--green)' : 'var(--fg-muted)', fontWeight: winnerTeam === 'B' ? 700 : 400 }}>{teamB}</span>
      {winnerTeam && <span style={{ color: 'var(--green)', fontSize: 10, marginLeft: 'auto', flexShrink: 0 }}>won</span>}
    </div>
  );
}

function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const players = (session.playerIds || []).map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const total = session.matches?.length || 0;
  const logged = session.matches?.filter(m => m.winner)?.length || 0;

  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <CrossedAxesIcon size={20} color="var(--fg-muted)" style={{ opacity: 0.35, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{date}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            {session.type === 'casual' ? 'Casual play' : 'Structured'} · {logged}/{total} matches
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex' }}>
            {players.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar player={p} size={28} />
              </div>
            ))}
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 18, lineHeight: 1, padding: '0 4px', opacity: 0.4 }}
              title="Delete session"
            >🗑</button>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-danger" onClick={() => onDelete(session.id)}>Delete</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 13, fontWeight: 600 }}>Cancel</button>
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fg-muted)', fontSize: 20, lineHeight: 1, padding: '0 2px',
              transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s',
            }}
          >›</button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: session.aiSummary ? 14 : 0 }}>
            {(session.matches || []).map((m, i) => <MatchLine key={i} match={m} />)}
          </div>
          {session.aiSummary && (
            <div style={{
              padding: '12px 14px', background: 'var(--canvas)', borderRadius: 10,
              fontSize: 12, color: 'var(--fg-body)', lineHeight: 1.7,
              fontStyle: 'italic', borderLeft: '2px solid var(--green)',
            }}>
              {session.aiSummary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionHistory({ sessions = [], onBack, onDelete }) {
  const sorted = [...sessions].reverse();

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 22, padding: '0 4px', lineHeight: 1 }}>‹</button>
        <ScrollIcon size={22} color="var(--fg)" />
        <span style={{ fontWeight: 800, fontSize: 20 }}>War Records</span>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>
          {sorted.length} {sorted.length === 1 ? 'battle' : 'battles'}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', borderStyle: 'dashed' }}>
          <ScrollIcon size={40} color="var(--fg-muted)" style={{ margin: '0 auto 14px', opacity: 0.2 }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg)', marginBottom: 8 }}>The scrolls are empty</div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>No battles have been recorded yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(s => <SessionCard key={s.id} session={s} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
