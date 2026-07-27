import { useState } from 'react';
import { SQUAD } from '../lib/players';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function Avatar({ player, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: player.color,
      color: player.textColor || '#f5f0e8',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * .36, fontWeight: 800,
      border: '2px solid var(--canvas)',
      flexShrink: 0,
    }}>
      {player.initials}
    </div>
  );
}

function PlayerAvatarRow({ playerIds, size = 24 }) {
  return (
    <div style={{ display: 'flex' }}>
      {playerIds.map((id, i) => {
        const p = SQUAD.find(q => q.id === id);
        if (!p) return null;
        return (
          <div key={id} style={{ marginLeft: i > 0 ? -6 : 0 }}>
            <Avatar player={p} size={size} />
          </div>
        );
      })}
    </div>
  );
}

export default function Calendar({ sessions, onDayClick, onDeleteSession }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // date string 'YYYY-MM-DD'

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  // Map sessions by date
  const sessionMap = {};
  sessions.forEach(s => {
    if (!sessionMap[s.date]) sessionMap[s.date] = [];
    sessionMap[s.date].push(s);
  });

  function dateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function todayStr() {
    return dateStr(today.getFullYear(), today.getMonth(), today.getDate());
  }

  const selectedSessions = selected ? (sessionMap[selected] || []) : [];
  const isPast = selected && selected <= todayStr();
  const isFuture = selected && selected > todayStr();

  // Build calendar grid
  const cells = [];
  // Prev month days
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + 1 + i, type: 'prev' });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'current' });
  }
  // Next month days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' });
  }

  function handleDayClick(cell) {
    if (cell.type !== 'current') return;
    const ds = dateStr(year, month, cell.day);
    setSelected(ds === selected ? null : ds);
  }

  function getSessionType(ds) {
    const ss = sessionMap[ds];
    if (!ss || ss.length === 0) return null;
    if (ss.some(s => s.type === 'structured')) return 'structured';
    return 'casual';
  }

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-muted)', padding: '4px 8px', borderRadius: 8, transition: 'color .15s' }}
          onMouseEnter={e => e.target.style.color = 'var(--fg)'}
          onMouseLeave={e => e.target.style.color = 'var(--fg-muted)'}
        >‹</button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{MONTHS[month]} {year}</div>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-muted)', padding: '4px 8px', borderRadius: 8, transition: 'color .15s' }}
          onMouseEnter={e => e.target.style.color = 'var(--fg)'}
          onMouseLeave={e => e.target.style.color = 'var(--fg-muted)'}
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', padding: '4px 0', letterSpacing: '.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          const ds = cell.type === 'current' ? dateStr(year, month, cell.day) : null;
          const isToday = ds === todayStr();
          const sessionType = ds ? getSessionType(ds) : null;
          const isFutureDate = ds && ds > todayStr();
          const isSelected = ds === selected;

          let bg = 'transparent';
          if (sessionType === 'structured') bg = 'rgba(45,106,79,.12)';
          else if (sessionType === 'casual') bg = 'rgba(233,196,106,.18)';
          if (isFutureDate && sessionMap[ds]?.length) bg = 'rgba(45,106,79,.07)';
          if (isSelected) bg = sessionType === 'casual' ? 'rgba(233,196,106,.3)' : 'rgba(45,106,79,.2)';

          return (
            <div
              key={i}
              className={`cal-day ${cell.type !== 'current' ? 'other-month' : ''} ${cell.type === 'current' ? 'clickable' : ''}`}
              onClick={() => handleDayClick(cell)}
              style={{
                background: bg,
                border: isToday ? '2px solid var(--green)' : isSelected ? '2px solid var(--green-mid)' : isFutureDate && sessionMap[ds]?.length ? '1.5px dashed var(--green-light)' : '1.5px solid transparent',
              }}
            >
              <span className="cal-num" style={{
                fontSize: 13,
                fontWeight: isToday ? 800 : 600,
                color: isToday ? 'var(--green)' : cell.type !== 'current' ? 'var(--fg-muted)' : 'var(--fg)',
              }}>
                {cell.day}
              </span>
              {sessionType === 'structured' && (
                <div className="cal-dot" style={{ background: 'var(--green)' }} />
              )}
              {sessionType === 'casual' && (
                <div className="cal-dot" style={{ background: 'var(--warm)' }} />
              )}
              {ds && isFutureDate && sessionMap[ds]?.length > 0 && !sessionType && (
                <div className="cal-dot" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-muted)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
          Match session
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-muted)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warm)' }} />
          Casual play
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div style={{ marginTop: 20, animation: 'slideDown .2s ease both' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)', marginBottom: 12 }}>
            {new Date(selected + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          {selectedSessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 14 }}>
                {isFuture ? 'Nothing scheduled yet — plan a session?' : 'No sessions on this day.'}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }} onClick={() => onDayClick(selected, 'structured')}>
                  🏸 {isFuture ? 'Schedule Session' : 'Log Session'}
                </button>
                <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => onDayClick(selected, 'casual')}>
                  🎾 Log Casual Play
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedSessions.map(s => (
                <div key={s.id} className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{s.type === 'casual' ? '🎾' : '🏸'}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {s.type === 'casual' ? 'Casual Play' : `Match Session · ${s.duration}h`}
                      </span>
                      {isFuture && <span className="badge badge-warm">Upcoming</span>}
                    </div>
                    <button className="btn-danger" onClick={() => onDeleteSession(s.id)}>Delete</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayerAvatarRow playerIds={s.playerIds || s.matches?.flatMap(m => [...(m.teamA||[]), ...(m.teamB||[])]).filter((v,i,a)=>a.indexOf(v)===i) || []} />
                    {s.sessionLeaderboard?.mvp && (
                      <span style={{ fontSize: 12, color: 'var(--fg-muted)', marginLeft: 6 }}>
                        MVP: <b style={{ color: 'var(--green)' }}>{SQUAD.find(p => p.id === s.sessionLeaderboard.mvp)?.name}</b>
                      </span>
                    )}
                  </div>
                  {s.aiSummary && (
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--fg-body)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      {s.aiSummary}
                    </p>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }} onClick={() => onDayClick(selected, 'structured')}>
                  + Add Session
                </button>
                <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => onDayClick(selected, 'casual')}>
                  + Log Casual Play
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
