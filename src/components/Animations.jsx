export function ShuttlecockSVG({ style = {} }) {
  return (
    <svg style={style} width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <ellipse cx="18" cy="28" rx="5.5" ry="4" fill="#c9a84c" />
      <ellipse cx="18" cy="28" rx="5.5" ry="4" fill="none" stroke="#a07830" strokeWidth=".8" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => (
        <line
          key={i}
          x1="18" y1="25"
          x2={18 + 11 * Math.sin((deg * Math.PI) / 180)}
          y2={25 - 17 * Math.cos((deg * Math.PI) / 180)}
          stroke="rgba(44,36,22,0.5)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="18" cy="8" rx="11" ry="4" fill="none" stroke="rgba(44,36,22,0.25)" strokeWidth="1" />
    </svg>
  );
}

export function RacketSVG({ swing = false }) {
  return (
    <svg
      className={swing ? 'racket-swing' : ''}
      width="24" height="32" viewBox="0 0 24 32"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="11" rx="9" ry="8.5" fill="none" stroke="var(--green)" strokeWidth="2" />
      {[-4, 0, 4].map(x => (
        <line key={x} x1={12 + x} y1="2.5" x2={12 + x} y2="19.5" stroke="var(--green)" strokeWidth=".8" opacity=".5" />
      ))}
      {[-3, 1, 5].map(y => (
        <line key={y} x1="3" y1={y + 11} x2="21" y2={y + 11} stroke="var(--green)" strokeWidth=".8" opacity=".5" />
      ))}
      <rect x="10.5" y="19" width="3" height="11" rx="1.5" fill="var(--fg-muted)" />
      <rect x="9.5" y="28" width="5" height="2.5" rx="1.25" fill="var(--border-hi)" />
    </svg>
  );
}

export function BadmintonNet() {
  return (
    <svg
      width="100%" height="36" viewBox="0 0 600 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', opacity: .7 }}
    >
      <rect x="2" y="0" width="5" height="36" rx="2.5" fill="var(--court)" />
      <rect x="593" y="0" width="5" height="36" rx="2.5" fill="var(--court)" />
      <line x1="4.5" y1="2" x2="595.5" y2="2" stroke="var(--green-mid)" strokeWidth="1.5" />
      <line x1="4.5" y1="34" x2="595.5" y2="34" stroke="var(--court)" strokeWidth="1" />
      {Array.from({ length: 38 }, (_, i) => (
        <line key={i} x1={4.5 + i * 15.6} y1="2" x2={4.5 + i * 15.6} y2="34"
          stroke="var(--green-light)" strokeWidth=".8" />
      ))}
      {[10, 18, 26].map(y => (
        <line key={y} x1="4.5" y1={y} x2="595.5" y2={y} stroke="var(--green-light)" strokeWidth=".8" />
      ))}
    </svg>
  );
}

export function Confetti() {
  const colors = ['#2d6a4f', '#e9c46a', '#c9533a', '#52b788', '#40916c', '#f4a261'];
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: 15 + Math.random() * 70,
    delay: Math.random() * 0.35,
    size: 6 + Math.random() * 7,
    dur: 0.9 + Math.random() * 0.5,
    rotate: Math.random() * 360,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '25%', left: `${p.left}%`,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.size > 9 ? '50%' : '2px',
          animation: `confettiFall ${p.dur}s ease-out ${p.delay}s both`,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </div>
  );
}

export function ShuttleTransition({ id }) {
  return <div key={id} className="shuttle-fly"><ShuttlecockSVG /></div>;
}
