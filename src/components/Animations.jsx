export function ShuttlecockSVG({ className = '' }) {
  return (
    <svg
      className={className}
      width="48" height="48" viewBox="0 0 48 48"
      aria-hidden="true"
    >
      {/* Cork base */}
      <ellipse cx="24" cy="38" rx="7" ry="5" fill="#e8c97a" />
      {/* Feathers */}
      {[0, 36, 72, 108, 144, 216, 252, 288, 324].map((deg, i) => (
        <line
          key={i}
          x1="24" y1="34"
          x2={24 + 14 * Math.sin((deg * Math.PI) / 180)}
          y2={34 - 20 * Math.cos((deg * Math.PI) / 180)}
          stroke="rgba(253,252,240,0.75)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      {/* Feather ring */}
      <ellipse cx="24" cy="14" rx="14" ry="5" fill="none" stroke="rgba(253,252,240,0.4)" strokeWidth="1" />
    </svg>
  );
}

export function RacketSVG({ swing = false }) {
  return (
    <svg
      className={swing ? 'racket-swing' : ''}
      width="32" height="40" viewBox="0 0 32 40"
      aria-hidden="true"
    >
      {/* String grid */}
      <ellipse cx="16" cy="14" rx="12" ry="11" fill="none" stroke="var(--green)" strokeWidth="1.5" />
      {[-6,-2,2,6].map(x => (
        <line key={x} x1={16+x} y1="3" x2={16+x} y2="25" stroke="var(--green)" strokeWidth="0.7" opacity="0.5" />
      ))}
      {[-5,-1,3,7].map(y => (
        <line key={y} x1="4" y1={y+14} x2="28" y2={y+14} stroke="var(--green)" strokeWidth="0.7" opacity="0.5" />
      ))}
      {/* Frame */}
      <ellipse cx="16" cy="14" rx="12" ry="11" fill="none" stroke="var(--fg)" strokeWidth="2" />
      {/* Handle */}
      <rect x="14" y="24" width="4" height="14" rx="2" fill="var(--fg-muted)" />
      <rect x="13" y="36" width="6" height="3" rx="1.5" fill="var(--border-hi)" />
    </svg>
  );
}

export function BadmintonNet() {
  return (
    <svg
      width="100%" height="40" viewBox="0 0 600 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Posts */}
      <rect x="4" y="0" width="6" height="40" rx="3" fill="var(--court)" />
      <rect x="590" y="0" width="6" height="40" rx="3" fill="var(--court)" />
      {/* Top wire */}
      <line x1="7" y1="3" x2="593" y2="3" stroke="rgba(253,252,240,0.5)" strokeWidth="1.5" />
      {/* Bottom wire */}
      <line x1="7" y1="37" x2="593" y2="37" stroke="rgba(253,252,240,0.3)" strokeWidth="1" />
      {/* Vertical mesh lines */}
      {Array.from({ length: 40 }, (_, i) => (
        <line
          key={i}
          x1={7 + i * 14.7} y1="3"
          x2={7 + i * 14.7} y2="37"
          stroke="rgba(42,74,58,0.8)"
          strokeWidth="1"
        />
      ))}
      {/* Horizontal mesh lines */}
      {[10, 18, 26].map(y => (
        <line key={y} x1="7" y1={y} x2="593" y2={y} stroke="rgba(42,74,58,0.8)" strokeWidth="1" />
      ))}
    </svg>
  );
}

export function Confetti({ onDone }) {
  const colors = ['#1ce783', '#ffd700', '#ff6b6b', '#4ecdc4', '#a78bfa', '#fb923c'];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: 20 + Math.random() * 60,
    delay: Math.random() * 0.4,
    size: 6 + Math.random() * 8,
    dur: 1 + Math.random() * 0.5,
    rotate: Math.random() * 360,
  }));

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}
      onAnimationEnd={onDone}
    >
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '30%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.size > 10 ? '50%' : '2px',
            animation: `confettiFall ${p.dur}s ease-out ${p.delay}s both`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function ShuttleTransition() {
  return <div className="shuttle-fly"><ShuttlecockSVG /></div>;
}
