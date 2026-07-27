import { useState } from 'react';
import { SQUAD } from '../lib/players';
import { Avatar } from './Avatar';

// --- Player selector chip ---
function PlayerChip({ player, onSelect }) {
  return (
    <button
      onClick={() => onSelect(player.id)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        border: '1.5px solid var(--border)',
        background: 'var(--elevated)',
        borderRadius: 10, padding: '6px 12px 6px 6px',
        cursor: 'pointer', transition: 'all .15s',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = player.color; e.currentTarget.style.background = `${player.color}12`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--elevated)'; }}
    >
      <Avatar player={player} size={22} border={false} />
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-body)' }}>{player.name}</span>
    </button>
  );
}

// --- Assigned player in a team slot ---
function AssignedPlayer({ player, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      border: `2px solid ${player.color}`,
      background: `${player.color}15`,
      borderRadius: 10, padding: '6px 8px 6px 6px',
    }}>
      <Avatar player={player} size={22} border={false} />
      <span style={{ fontSize: 13, fontWeight: 700, color: player.color }}>{player.name}</span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: player.color, fontSize: 16, lineHeight: 1, padding: '0 2px', opacity: .7 }}
      >×</button>
    </div>
  );
}

// --- Match builder: pick team A then team B ---
function MatchBuilder({ squadIds, onAdd }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);

  const squad = SQUAD.filter(p => squadIds.includes(p.id));
  const taken = [...teamA, ...teamB];
  const available = squad.filter(p => !taken.includes(p.id));

  // Auto-fill the other team when no choices remain
  const teamAFull = teamA.length >= 2;
  const teamBFull = teamB.length >= 2;

  // If teamA has players and nothing is left for teamB to pick from, auto-assign remaining
  const autoB = teamA.length >= 1 && teamB.length === 0 && available.length > 0 && available.length <= (squad.length - teamA.length);
  const effectiveB = autoB ? available.map(p => p.id) : teamB;

  function addToA(id) {
    setTeamA(prev => {
      const next = [...prev, id];
      // After adding to A, if remaining players === squad.length - next.length and B is empty, auto-fill B
      return next;
    });
  }
  function addToB(id) { setTeamB(prev => [...prev, id]); }
  function removeFromA(id) { setTeamA(prev => prev.filter(x => x !== id)); }
  function removeFromB(id) { setTeamB(prev => prev.filter(x => x !== id)); }

  // Remaining after both teams are tentatively assigned
  const takenWithAuto = [...teamA, ...effectiveB];
  const stillAvailableForA = squad.filter(p => !takenWithAuto.includes(p.id));

  const canAdd = teamA.length >= 1 && effectiveB.length >= 1;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({ teamA, teamB: effectiveB });
    setTeamA([]);
    setTeamB([]);
  }

  const displayB = effectiveB;
  const bIsAuto = autoB && teamB.length === 0;

  return (
    <div style={{ background: 'var(--canvas)', borderRadius: 14, padding: 16, border: '1.5px dashed var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
        Build a match
      </div>

      {/* Team A */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)', marginBottom: 8 }}>
          Team A {teamA.length > 0 && <span style={{ color: 'var(--green)', marginLeft: 4 }}>({teamA.map(id => SQUAD.find(p=>p.id===id)?.name).join(' & ')})</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 36, alignItems: 'center' }}>
          {teamA.map(id => {
            const p = SQUAD.find(q => q.id === id);
            return p ? <AssignedPlayer key={id} player={p} onRemove={() => removeFromA(id)} /> : null;
          })}
          {!teamAFull && available.filter(p => !effectiveB.includes(p.id)).map(p => (
            <PlayerChip key={p.id} player={p} onSelect={addToA} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'var(--fg-muted)', margin: '8px 0' }}>vs</div>

      {/* Team B */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)' }}>Team B</span>
          {displayB.length > 0 && <span style={{ color: bIsAuto ? 'var(--fg-muted)' : 'var(--green)', fontSize: 12, fontWeight: 700 }}>({displayB.map(id => SQUAD.find(p=>p.id===id)?.name).join(' & ')})</span>}
          {bIsAuto && <span style={{ fontSize: 10, color: 'var(--fg-muted)', fontStyle: 'italic' }}>auto</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 36, alignItems: 'center' }}>
          {!bIsAuto && displayB.map(id => {
            const p = SQUAD.find(q => q.id === id);
            return p ? <AssignedPlayer key={id} player={p} onRemove={() => removeFromB(id)} /> : null;
          })}
          {bIsAuto && displayB.map(id => {
            const p = SQUAD.find(q => q.id === id);
            return p ? (
              <div key={id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                border: `1.5px dashed ${p.color}60`, background: `${p.color}08`,
                borderRadius: 10, padding: '6px 10px 6px 6px',
              }}>
                <Avatar player={p} size={22} border={false} />
                <span style={{ fontSize: 13, fontWeight: 700, color: p.color, opacity: 0.8 }}>{p.name}</span>
              </div>
            ) : null;
          })}
          {!bIsAuto && !teamBFull && available.filter(p => !teamA.includes(p.id)).map(p => (
            <PlayerChip key={p.id} player={p} onSelect={addToB} />
          ))}
          {teamA.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Pick Team A first</span>
          )}
        </div>
      </div>

      <button
        className="btn-secondary"
        style={{ width: '100%', fontSize: 13, opacity: canAdd ? 1 : 0.4 }}
        onClick={handleAdd}
        disabled={!canAdd}
      >
        + Add Match
      </button>
    </div>
  );
}

// --- Logged match card ---
function MatchCard({ match, index, onSetWinner, onRemove }) {
  function TeamBtn({ ids, side }) {
    const isWinner = match.winner === side;
    const isLoser = match.winner && !isWinner;
    const names = ids.map(id => SQUAD.find(p => p.id === id)?.name || id);
    return (
      <button
        onClick={() => !match.winner && onSetWinner(index, side)}
        disabled={!!match.winner}
        style={{
          flex: 1, padding: '10px 8px', borderRadius: 10,
          border: `2px solid ${isWinner ? 'var(--green)' : 'var(--border)'}`,
          background: isWinner ? 'var(--green-bg)' : 'var(--canvas)',
          cursor: match.winner ? 'default' : 'pointer',
          opacity: isLoser ? 0.45 : 1,
          transition: 'all .15s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}
      >
        <div style={{ display: 'flex', gap: -4 }}>
          {ids.map((id, i) => {
            const p = SQUAD.find(q => q.id === id);
            return p ? (
              <div key={id} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                <Avatar player={p} size={26} />
              </div>
            ) : null;
          })}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--fg-body)' }}>
          {names.join(' & ')}{isWinner && ' ✓'}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', border: `1.5px solid ${match.winner ? 'rgba(45,106,79,.3)' : 'var(--border)'}`,
      borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Match {index + 1}
        </span>
        {!match.winner && (
          <button
            onClick={() => onRemove(index)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 18, padding: '0 2px', lineHeight: 1 }}
          >×</button>
        )}
        {match.winner && (
          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>Logged ✓</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <TeamBtn ids={match.teamA} side="A" />
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-muted)', flexShrink: 0 }}>vs</div>
        <TeamBtn ids={match.teamB} side="B" />
      </div>
      {!match.winner && (
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 8 }}>
          Tap a team to log winner
        </div>
      )}
    </div>
  );
}

// --- Main component ---
export default function CasualLog({ date, onProceed, onClose }) {
  const [step, setStep] = useState('players');
  const [squadIds, setSquadIds] = useState(SQUAD.map(p => p.id));
  const [matches, setMatches] = useState([]);

  function togglePlayer(id) {
    setSquadIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  }

  function addMatch({ teamA, teamB }) {
    setMatches(prev => [...prev, {
      matchId: prev.length + 1,
      teamA, teamB,
      format: 'Casual',
      winner: null,
    }]);
  }

  function setWinner(index, side) {
    setMatches(prev => prev.map((m, i) => i === index ? { ...m, winner: side } : m));
  }

  function removeMatch(index) {
    setMatches(prev => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, matchId: i + 1 })));
  }

  const players = SQUAD.filter(p => squadIds.includes(p.id));
  const loggedCount = matches.filter(m => m.winner).length;
  const canFinish = matches.length > 0 && loggedCount === matches.length;

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,7,13,.92)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 50, padding: '16px', overflowY: 'auto',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 26, animation: 'fadeUp .25s ease both', marginTop: 16 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>🎾 Casual Play</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 22 }}>{displayDate}</div>

        {step === 'players' ? (
          <>
            <div className="section-label">Who's playing?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {SQUAD.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px',
                    borderRadius: 14,
                    outline: squadIds.includes(p.id) ? `2px solid ${p.color}` : '2px solid transparent',
                    backgroundColor: squadIds.includes(p.id) ? `${p.color}15` : 'transparent',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{
                    opacity: squadIds.includes(p.id) ? 1 : 0.35,
                    transition: 'opacity .15s',
                    boxShadow: squadIds.includes(p.id) ? `0 3px 12px ${p.color}45` : 'none',
                    borderRadius: '50%',
                  }}>
                    <Avatar player={p} size={52} border={false} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: squadIds.includes(p.id) ? 'var(--fg)' : 'var(--fg-muted)' }}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setStep('matches')}
              disabled={squadIds.length < 2}
            >
              Log Matches →
            </button>
          </>
        ) : (
          <>
            {/* Players summary row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              {players.map((p, i) => (
                <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                  <Avatar player={p} size={30} />
                </div>
              ))}
              <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 600, marginLeft: 6 }}>
                {loggedCount}/{matches.length} logged
              </span>
            </div>

            {/* Logged matches */}
            {matches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {matches.map((m, i) => (
                  <MatchCard key={i} match={m} index={i} onSetWinner={setWinner} onRemove={removeMatch} />
                ))}
              </div>
            )}

            {/* Add match — only shown when last match has a winner */}
            {(matches.length === 0 || matches[matches.length - 1].winner) && (
              <div style={{ marginBottom: 20 }}>
                <MatchBuilder squadIds={squadIds} onAdd={addMatch} />
              </div>
            )}

            {/* Prompt to log winner before adding next match */}
            {matches.length > 0 && !matches[matches.length - 1].winner && (
              <div style={{
                marginBottom: 20, padding: '14px 16px',
                background: 'var(--canvas)', border: '1.5px dashed var(--border)',
                borderRadius: 14, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 600 }}>
                  Tap the winning team above to log the result, then add another match.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', opacity: canFinish ? 1 : 0.4 }}
                onClick={() => canFinish && onProceed({ players, matches })}
                disabled={!canFinish}
              >
                Done — View Results →
              </button>
              <button className="btn-secondary" onClick={() => setStep('players')}>← Back</button>
            </div>
            {!canFinish && matches.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 8 }}>
                Log all match winners first
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
