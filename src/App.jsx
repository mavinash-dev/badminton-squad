import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Setup from './components/Setup';
import Schedule from './components/Schedule';
import MatchLogger from './components/MatchLogger';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import CasualLog from './components/CasualLog';
import { ShuttleTransition, ShuttlecockSVG } from './components/Animations';
import { generateSchedule } from './lib/grok';
import { generateMatches } from './lib/tournament';
import { readHistory, writeHistory } from './lib/github';

export default function App() {
  const [view, setView] = useState('home');   // home | schedule | results | leaderboard
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyCache, setHistoryCache] = useState(null);

  // Modal states
  const [setupDate, setSetupDate] = useState(null);
  const [casualDate, setCasualDate] = useState(null);
  const [loggingMatchId, setLoggingMatchId] = useState(null);

  // Session flow state
  const [sessionPlayers, setSessionPlayers] = useState([]);
  const [sessionDate, setSessionDate] = useState(null);
  const [matches, setMatches] = useState([]);

  // Shuttle animation
  const [shuttleKey, setShuttleKey] = useState(0);
  const [showShuttle, setShowShuttle] = useState(false);

  function shuttle() {
    setShuttleKey(k => k + 1);
    setShowShuttle(true);
    setTimeout(() => setShowShuttle(false), 2000);
  }

  // Load history on mount
  useEffect(() => {
    readHistory()
      .then(({ data, sha }) => {
        setHistoryCache({ data, sha });
        setSessions(data.sessions || []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  async function refreshHistory() {
    try {
      const { data, sha } = await readHistory();
      setHistoryCache({ data, sha });
      setSessions(data.sessions || []);
    } catch {}
  }

  // --- Session flow ---
  async function handleGenerate({ players, hours, date }) {
    setSetupDate(null);
    setSessionPlayers(players);
    setSessionDate(date);

    let builtMatches;
    try {
      const grokResult = await generateSchedule({ players, hours });
      if (grokResult?.matches) {
        builtMatches = grokResult.matches.map((m, i) => ({
          matchId: m.id || i + 1,
          teamA: m.teamA.map(name => players.find(p => p.name === name)?.id).filter(Boolean),
          teamB: m.teamB.map(name => players.find(p => p.name === name)?.id).filter(Boolean),
          format: m.format,
          winner: null,
        }));
        if (builtMatches.some(m => !m.teamA.length || !m.teamB.length)) throw new Error('mapping');
      } else throw new Error('no matches');
    } catch {
      builtMatches = generateMatches(players, hours).map(m => ({ ...m, winner: null }));
    }

    setMatches(builtMatches);
    shuttle();
    setView('schedule');
  }

  function handleLogWinner(matchId, side) {
    setMatches(prev => prev.map(m => m.matchId === matchId ? { ...m, winner: side } : m));
    setLoggingMatchId(null);
  }

  async function handleSessionSaved() {
    await refreshHistory();
    shuttle();
    setView('home');
  }

  // --- Casual log ---
  async function handleCasualSave({ type, playerIds, note, date }) {
    setCasualDate(null);
    try {
      const { data: history, sha } = historyCache
        ? await readHistory()
        : { data: { players: [], duos: {}, sessions: [] }, sha: null };

      const sessionId = `s_${date.replace(/-/g, '')}_casual_${Date.now()}`;
      const session = {
        id: sessionId, date, type: 'casual',
        playerIds, note,
        matches: [], sessionLeaderboard: {}, aiSummary: '',
      };
      history.sessions.push(session);

      if (sha) {
        await writeHistory(history, sha, date);
      }
      await refreshHistory();
    } catch (e) {
      console.error('Save casual failed', e);
    }
  }

  // --- Delete session ---
  async function handleDeleteSession(id) {
    try {
      const { data: history, sha } = await readHistory();
      history.sessions = history.sessions.filter(s => s.id !== id);
      await writeHistory(history, sha, 'delete-session');
      await refreshHistory();
    } catch (e) {
      console.error('Delete failed', e);
    }
  }

  const logMatch = loggingMatchId !== null ? matches.find(m => m.matchId === loggingMatchId) : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ minHeight: '100vh' }}>
      {showShuttle && <ShuttleTransition id={shuttleKey} />}

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 0',
        maxWidth: 640, margin: '0 auto',
      }}>
        <button
          onClick={() => { shuttle(); setView('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ShuttlecockSVG style={{ width: 30, height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--fg)', letterSpacing: '-.3px' }}>
            Badminton Squad
          </span>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={view === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 16px' }}
            onClick={() => { shuttle(); setView('leaderboard'); }}
          >
            🏆 Leaderboard
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: 13, padding: '7px 16px' }}
            onClick={() => setSetupDate(today)}
          >
            + Session
          </button>
        </div>
      </header>

      {/* Views */}
      <div className="app-wrap" style={{ paddingTop: 24 }}>
        {view === 'home' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Hey squad 🏸</div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 15 }}>
                {loading ? 'Loading sessions…' : `${sessions.length} sessions played`}
              </div>
            </div>
            <div className="card">
              <Calendar
                sessions={sessions}
                onDayClick={(date, type) => {
                  if (type === 'casual') setCasualDate(date);
                  else setSetupDate(date);
                }}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          </div>
        )}

        {view === 'schedule' && (
          <Schedule
            matches={matches}
            players={sessionPlayers}
            onLogWinner={id => setLoggingMatchId(id)}
            onViewResults={() => { shuttle(); setView('results'); }}
            onBack={() => setView('home')}
          />
        )}

        {view === 'results' && (
          <Results
            players={sessionPlayers}
            matches={matches}
            date={sessionDate}
            onSaved={handleSessionSaved}
            onBack={() => setView('schedule')}
          />
        )}

        {view === 'leaderboard' && (
          <Leaderboard onBack={() => setView('home')} />
        )}
      </div>

      {/* Modals */}
      {setupDate && (
        <Setup
          date={setupDate}
          onGenerate={handleGenerate}
          onClose={() => setSetupDate(null)}
        />
      )}

      {casualDate && (
        <CasualLog
          date={casualDate}
          onSave={handleCasualSave}
          onClose={() => setCasualDate(null)}
        />
      )}

      {logMatch && (
        <MatchLogger
          match={logMatch}
          onLog={handleLogWinner}
          onClose={() => setLoggingMatchId(null)}
        />
      )}
    </div>
  );
}
