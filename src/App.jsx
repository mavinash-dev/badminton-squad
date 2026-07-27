import { useState } from 'react';
import Setup from './components/Setup';
import Schedule from './components/Schedule';
import MatchLogger from './components/MatchLogger';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import { ShuttleTransition, ShuttlecockSVG } from './components/Animations';
import { generateSchedule } from './lib/grok';
import { generateMatches } from './lib/tournament';

export default function App() {
  const [view, setView] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loggingMatchId, setLoggingMatchId] = useState(null);
  const [showShuttle, setShowShuttle] = useState(false);
  const [shuttleKey, setShuttleKey] = useState(0);

  function triggerShuttle() {
    setShuttleKey(k => k + 1);
    setShowShuttle(true);
    setTimeout(() => setShowShuttle(false), 2000);
  }

  async function handleGenerate({ players: ps, hours }) {
    setPlayers(ps);

    let builtMatches;
    try {
      const grokResult = await generateSchedule({ players: ps, hours });
      if (grokResult?.matches) {
        builtMatches = grokResult.matches.map((m, i) => ({
          matchId: m.id || i + 1,
          teamA: m.teamA.map(name => ps.find(p => p.name === name)?.id).filter(Boolean),
          teamB: m.teamB.map(name => ps.find(p => p.name === name)?.id).filter(Boolean),
          format: m.format,
          winner: null,
        }));
        // Fall back if mapping failed
        if (builtMatches.some(m => !m.teamA.length || !m.teamB.length)) throw new Error('mapping');
      } else {
        throw new Error('no matches');
      }
    } catch {
      builtMatches = generateMatches(ps, hours).map(m => ({ ...m, winner: null }));
    }

    setMatches(builtMatches);
    triggerShuttle();
    setView('schedule');
  }

  function handleLogWinner(matchId, side) {
    setMatches(prev => prev.map(m => m.matchId === matchId ? { ...m, winner: side } : m));
    setLoggingMatchId(null);
  }

  function handleSaved() {
    triggerShuttle();
    setView('leaderboard');
  }

  function navTo(v) {
    triggerShuttle();
    setView(v);
  }

  const logMatch = loggingMatchId !== null ? matches.find(m => m.matchId === loggingMatchId) : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="top-band" />

      {showShuttle && <ShuttleTransition key={shuttleKey} />}

      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 24px 0',
        maxWidth: 700, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navTo('setup')}>
          <ShuttlecockSVG style={{ width: 28, height: 28 }} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.3px', color: 'var(--fg)' }}>
            Badminton Squad
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {view !== 'setup' && (
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: '7px 14px' }}
              onClick={() => navTo('setup')}
            >
              New Session
            </button>
          )}
          <button
            className={view === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '7px 14px' }}
            onClick={() => navTo('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </nav>

      {view === 'setup' && <Setup onGenerate={handleGenerate} />}
      {view === 'schedule' && (
        <Schedule
          matches={matches}
          players={players}
          onLogWinner={id => setLoggingMatchId(id)}
          onViewResults={() => { triggerShuttle(); setView('results'); }}
        />
      )}
      {view === 'results' && (
        <Results players={players} matches={matches} onSaved={handleSaved} />
      )}
      {view === 'leaderboard' && <Leaderboard />}

      {logMatch && (
        <MatchLogger
          match={logMatch}
          players={players}
          onLog={handleLogWinner}
          onClose={() => setLoggingMatchId(null)}
        />
      )}
    </div>
  );
}
