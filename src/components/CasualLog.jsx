import { useState } from 'react';
import { SQUAD } from '../lib/players';

const PLAYER_COLORS = Object.fromEntries(SQUAD.map(p => [p.id, p]));

function PlayerChip({ player, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        border: `2px solid ${selected ? player.color : 'var(--border)'}`,
        background: selected ? `${player.color}18` : 'var(--elevated)',
        borderRadius: 10, padding: '7px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all .15s',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: player.color, color: player.textColor || '#f5f0e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 800,
      }}>{player.initials}</div>
      <span style={{ fontSize: 13, fontWeight: 700, color: selected ? player.color : 'var(--fg-muted)' }}>
        {player.name}
      </span>
    </button>
  );
}

function MatchBuilder({ squadIds, onAdd }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);

  const squad = SQUAD.filter(p => squadIds.includes(p.id));

  function toggleA(id) {
    if (teamB.includes(id)) return;
    setTeamA(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleB(id) {
    if (teamA.includes(id)) return;
    setTeamB(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const canAdd = teamA.length >= 1 && teamB.length >= 1;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({ teamA, teamB });
    setTeamA([]);
    setTeamB([]);
  }

  return (
    <div style={{ background: 'var(--canvas)', borderRadius: 12, padding: 16, border: '1.5px dashed var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
        Add a match
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)', marginBottom: 6 }}>Team A</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {squad.map(p => (
            <PlayerChip
              key={p.id} player={p}
              selected={teamA.includes(p.id)}
              onClick={() => toggleA(p.id)}
              disabled={teamB.includes(p.id)}
            />
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--fg-muted)', margin: '8px 0' }}>vs</div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)', marginBottom: 6 }}>Team B</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {squad.map(p => (
            <PlayerChip
              key={p.id} player={p}
              selected={teamB.includes(p.id)}
              onClick={() => toggleB(p.id)}
              disabled={teamA.includes(p.id)}
            />
          ))}
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

function MatchCard({ match, index, onSetWinner, onRemove }) {
  const teamAPlayers = match.teamA.map(id => PLAYER_COLORS[id]).filter(Boolean);
  const teamBPlayers = match.teamB.map(id => PLAYER_COLORS[id]).filter(Boolean);

  function TeamBtn({ ids, side }) {
    const isWinner = match.winner === side;
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
          transition: 'all .15s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}
      >
        <div style={{ display: 'flex', gap: 2 }}>
          {ids.map(id => {
            const p = PLAYER_COLORS[id];
            return p ? (
              <div key={id} style={{
                width: 22, height: 22, borderRadius: '50%',
                background: p.color, color: p.textColor || '#f5f0e8',
                fontSize: 8, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{p.initials}</div>
            ) : null;
          })}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--fg-body)' }}>
          {names.join(' & ')}
          {isWinner && ' 🏆'}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: 12, padding: '12px 14px',
      borderColor: match.winner ? 'rgba(45,106,79,.3)' : 'var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Match {index + 1}
        </span>
        {!match.winner && (
          <button
            onClick={() => onRemove(index)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 16, padding: '0 2px', lineHeight: 1 }}
          >×</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <TeamBtn ids={match.teamA} side="A" />
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 800, color: 'var(--fg-muted)' }}>vs</div>
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

export default function CasualLog({ date, onProceed, onClose }) {
  const [step, setStep] = useState('players'); // players | matches
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
    setMatches(prev => [...prev, { matchId: prev.length + 1, teamA, teamB, format: 'Casual', winner: null }]);
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
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(245,240,232,.90)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 50, padding: '16px 16px', overflowY: 'auto',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 26, animation: 'fadeUp .25s ease both', marginTop: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>🎾 Casual Play</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 22 }}>{displayDate}</div>

        {step === 'players' ? (
          <>
            <div className="section-label">Who's playing?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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
                    width: 48, height: 48, borderRadius: '50%',
                    background: p.color, color: p.textColor || '#f5f0e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 800,
                    opacity: squadIds.includes(p.id) ? 1 : 0.35,
                    boxShadow: squadIds.includes(p.id) ? `0 3px 12px ${p.color}40` : 'none',
                    transition: 'all .15s',
                  }}>{p.initials}</div>
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
            {/* Players summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              {players.map(p => (
                <div key={p.id} style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: p.color, color: p.textColor || '#f5f0e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>{p.initials}</div>
              ))}
              <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 600, marginLeft: 4 }}>
                {loggedCount}/{matches.length} matches logged
              </span>
            </div>

            {/* Match list */}
            {matches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {matches.map((m, i) => (
                  <MatchCard key={i} match={m} index={i} onSetWinner={setWinner} onRemove={removeMatch} />
                ))}
              </div>
            )}

            {/* Add match builder */}
            <div style={{ marginBottom: 20 }}>
              <MatchBuilder squadIds={squadIds} onAdd={addMatch} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', opacity: canFinish ? 1 : 0.4 }}
                onClick={() => canFinish && onProceed({ players, matches })}
                disabled={!canFinish}
              >
                View Results →
              </button>
              <button className="btn-secondary" onClick={() => setStep('players')}>← Players</button>
            </div>
            {!canFinish && matches.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 8 }}>
                Log winners for all matches to continue
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
