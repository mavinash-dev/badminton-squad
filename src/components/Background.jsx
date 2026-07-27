// Atmospheric background: drifting orbs + court grid + floating shuttles
export default function Background() {
  // Shuttle positions for background floaters
  const shuttles = [
    { left: '8%',  delay: '0s',   dur: '22s', dx: '120px' },
    { left: '25%', delay: '-8s',  dur: '30s', dx: '60px'  },
    { left: '50%', delay: '-15s', dur: '26s', dx: '90px'  },
    { left: '70%', delay: '-3s',  dur: '34s', dx: '40px'  },
    { left: '88%', delay: '-20s', dur: '28s', dx: '100px' },
  ];

  return (
    <div className="bg-scene" aria-hidden="true">
      {/* Grid */}
      <div className="bg-court" />

      {/* Gradient orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Floating shuttle silhouettes */}
      <div className="bg-shuttles">
        {shuttles.map((s, i) => (
          <div
            key={i}
            className="bg-shuttle"
            style={{
              left: s.left,
              bottom: '-60px',
              '--dx': s.dx,
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 36 36">
              <ellipse cx="18" cy="28" rx="5.5" ry="4" fill="rgba(52,211,153,0.5)" />
              {[0,45,90,135,180,225,270,315].map((deg, j) => (
                <line
                  key={j}
                  x1="18" y1="25"
                  x2={18 + 10 * Math.sin((deg * Math.PI) / 180)}
                  y2={25 - 16 * Math.cos((deg * Math.PI) / 180)}
                  stroke="rgba(52,211,153,0.35)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              ))}
              <ellipse cx="18" cy="9" rx="10" ry="3.5" fill="none" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
