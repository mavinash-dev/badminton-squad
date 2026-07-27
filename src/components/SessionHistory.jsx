import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';
import { CrossedSwordsSVG, ScrollSVG } from './Icons';

function MatchLine({ match }) {
  const teamA = (match.teamA || []).map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  const teamB = (match.teamB || []).map(id => SQUAD.find(p => p.id === id)?.name || id).join(' & ');
  const winnerTeam = match.winner === 'A' ? 'A' : match.winner === 'B' ? 'B' : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)', padding: '3px 0' }}>
      <span style={{ color: winnerTeam === 'A' ? 'var(--green)' : 'inherit', fontWeight: winnerTeam === 'A' ? 700 : 400 }}>{teamA}</span>
      <span style={{ opacity: 0.4, fontSize: 10 }}>vs</span>
      <span style={{ color: winnerTeam === 'B' ? 'var(--green)' : 'inherit', fontWeight: winnerTeam === 'B' ? 700 : 400 }}>{teamB}</span>
      {winnerTeam && <span style={{ color: 'var(--green)', fontSize: 10, marginLeft: 2 }}>✓</span>}
    </div>
  );
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const players = (session.playerIds || []).map(id => SQUAD.find(p => p.id === id)).filter(Boolean);
  const total = session.matches?.length || 0;
  const logged = session.matches?.filter(m => m.winner)?.length || 0;

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ opacity: 0.35 }}>
          <CrossedSwordsSVG size={18} color="var(--fg)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>{date}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
            {session.type === 'casual' ? 'Casual play' : 'Structured'} · {logged}/{total} matches logged
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex' }}>
            {players.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar player={p} size={26} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 18, lineHeight: 1, padding: '0 2px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          >
            ›
          </button>
        </div>
      </div>

      {expanded && session.matches?.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {session.matches.map((m, i) => (
            <MatchLine key={i} match={m} />
          ))}
          {session.aiSummary && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--canvas)', borderRadius: 8, fontSize: 12, color: 'var(--fg-body)', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '2px solid var(--green)' }}>
              {session.aiSummary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionHistory({ sessions = [], onBack }) {
  const sorted = [...sessions].reverse();

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScrollSVG size={20} color="var(--fg)" />
          <span style={{ fontWeight: 800, fontSize: 20 }}>War Records</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>
          {sorted.length} battles
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderStyle: 'dashed' }}>
          <ScrollSVG size={36} color="var(--fg-muted)" style={{ margin: '0 auto 12px', opacity: 0.25 }} />
          <div style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>The scrolls are empty</div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>No battles have been recorded yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}
