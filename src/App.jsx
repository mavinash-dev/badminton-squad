import { useState, useEffect } from 'react';
import SessionHistory from './components/SessionHistory';
import Home from './components/Home';
import Setup from './components/Setup';
import Schedule from './components/Schedule';
import MatchLogger from './components/MatchLogger';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import CasualLog from './components/CasualLog';
import { ShuttleTransition, ShuttlecockSVG } from './components/Animations';
import Background from './components/Background';
import { generateSchedule } from './lib/grok';
import { generateMatches } from './lib/tournament';
import { readHistory, writeHistory } from './lib/github';

const EMPTY_HISTORY = { players: [], duos: {}, sessions: [] };

export default function App() {
  const [view, setView] = useState('home');
  const [history, setHistory] = useState(EMPTY_HISTORY);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [setupDate, setSetupDate] = useState(null);
  const [casualDate, setCasualDate] = useState(null);
  const [loggingMatchId, setLoggingMatchId] = useState(null);

  // Shared session flow state
  const [sessionPlayers, setSessionPlayers] = useState([]);
  const [sessionDate, setSessionDate] = useState(null);
  const [sessionType, setSessionType] = useState('structured');
  const [matches, setMatches] = useState([]);

  // Shuttle animation
  const [shuttleKey, setShuttleKey] = useState(0);
  const [showShuttle, setShowShuttle] = useState(false);

  function shuttle() {
    setShuttleKey(k => k + 1);
    setShowShuttle(true);
    setTimeout(() => setShowShuttle(false), 2000);
  }

  useEffect(() => {
    readHistory()
      .then(({ data }) => setHistory(data))
      .catch(() => setHistory(EMPTY_HISTORY))
      .finally(() => setLoading(false));
  }, []);

  async function refreshHistory() {
    try {
      const { data } = await readHistory();
      setHistory(data);
    } catch {}
  }

  // --- Structured session flow ---
  async function handleGenerate({ players, matchCount, hours, date }) {
    setSetupDate(null);
    setSessionPlayers(players);
    setSessionDate(date);
    setSessionType('structured');

    let builtMatches;
    try {
      const grokResult = await generateSchedule({ players, matchCount, hours });
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
      const fallbackCount = matchCount || (hours === 2 ? (players.length === 4 ? 6 : 9) : (players.length === 4 ? 4 : 6));
      builtMatches = generateMatches(players, fallbackCount).map(m => ({ ...m, winner: null }));
    }

    setMatches(builtMatches);
    shuttle();
    setView('schedule');
  }

  function handleLogWinner(matchId, side) {
    setMatches(prev => prev.map(m => m.matchId === matchId ? { ...m, winner: side } : m));
    setLoggingMatchId(null);
  }

  // --- Casual session ---
  function handleCasualProceed({ players, matches: casualMatches }) {
    setCasualDate(null);
    setSessionPlayers(players);
    setSessionDate(casualDate);
    setSessionType('casual');
    setMatches(casualMatches);
    shuttle();
    setView('results');
  }

  async function handleSessionSaved() {
    await refreshHistory();
    shuttle();
    setView('home');
  }

  // --- Delete session ---
  async function handleDeleteSession(id) {
    try {
      const { data: hist, sha } = await readHistory();
      hist.sessions = hist.sessions.filter(s => s.id !== id);
      await writeHistory(hist, sha, 'delete-session');
      await refreshHistory();
    } catch (e) {
      console.error('Delete failed', e);
    }
  }

  const logMatch = loggingMatchId !== null ? matches.find(m => m.matchId === loggingMatchId) : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="app-root">
      <Background />
      {showShuttle && <ShuttleTransition id={shuttleKey} />}

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
          {view !== 'home' && (
            <button
              className="btn-secondary"
              style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => { shuttle(); setView('home'); }}
            >
              ← Home
            </button>
          )}
          <button
            className="btn-primary"
            style={{ fontSize: 13, padding: '7px 16px' }}
            onClick={() => setSetupDate(today)}
          >
            + Session
          </button>
        </div>
      </header>

      <div className="app-wrap" style={{ paddingTop: 24 }}>

        {view === 'home' && (
          <Home
            history={history}
            loading={loading}
            today={today}
            onNewSession={date => setSetupDate(date)}
            onCasual={date => setCasualDate(date)}
            onViewHistory={() => { shuttle(); setView('calendar'); }}
            onViewLeaderboard={() => { shuttle(); setView('leaderboard'); }}
          />
        )}

        {view === 'calendar' && (
          <SessionHistory sessions={history.sessions || []} onBack={() => setView('home')} />
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
            sessionType={sessionType}
            onSaved={handleSessionSaved}
            onBack={() => sessionType === 'casual' ? setView('home') : setView('schedule')}
          />
        )}

        {view === 'leaderboard' && <Leaderboard sessions={history.sessions} onBack={() => setView('home')} />}
      </div>

      {/* Modals */}
      {setupDate && (
        <Setup date={setupDate} onGenerate={handleGenerate} onClose={() => setSetupDate(null)} />
      )}

      {casualDate && (
        <CasualLog date={casualDate} onProceed={handleCasualProceed} onClose={() => setCasualDate(null)} />
      )}

      {logMatch && (
        <MatchLogger match={logMatch} onLog={handleLogWinner} onClose={() => setLoggingMatchId(null)} />
      )}
    </div>
  );
}
