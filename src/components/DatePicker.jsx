import { useState } from 'react';
import { todayIST } from '../lib/date';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function parseYM(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1 }; // month 0-indexed
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DatePicker({ value, onChange }) {
  const today = todayIST();
  const { year: initY, month: initM } = parseYM(value || today);
  const [viewYear, setViewYear] = useState(initY);
  const [viewMonth, setViewMonth] = useState(initM);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);

  // Build grid cells
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ userSelect: 'none' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 20, padding: '4px 8px', borderRadius: 8, lineHeight: 1 }}
        >‹</button>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 20, padding: '4px 8px', borderRadius: 8, lineHeight: 1 }}
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', padding: '4px 0', letterSpacing: '.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isSelected = dateStr === value;
          const isToday = dateStr === today;
          return (
            <button
              key={i}
              onClick={() => onChange(dateStr)}
              style={{
                background: isSelected ? 'var(--green)' : 'none',
                border: isToday && !isSelected ? '1.5px solid var(--green)' : '1.5px solid transparent',
                borderRadius: 8,
                color: isSelected ? '#07070d' : isToday ? 'var(--green)' : 'var(--fg-body)',
                fontWeight: isSelected || isToday ? 700 : 400,
                fontSize: 13,
                padding: '7px 2px',
                cursor: 'pointer',
                transition: 'all .12s',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
