// Atmospheric GoT-style background: dark gradient orbs + rising ember particles

const EMBERS = [
  { left: '5%',  delay: '0s',   dur: '18s', dx: '30px',  dx2: '-15px', size: 3, op: 0.5 },
  { left: '15%', delay: '-5s',  dur: '24s', dx: '-20px', dx2: '10px',  size: 2, op: 0.4 },
  { left: '28%', delay: '-11s', dur: '20s', dx: '15px',  dx2: '-8px',  size: 4, op: 0.35 },
  { left: '40%', delay: '-3s',  dur: '28s', dx: '-25px', dx2: '20px',  size: 2, op: 0.45 },
  { left: '52%', delay: '-17s', dur: '22s', dx: '20px',  dx2: '-12px', size: 3, op: 0.3 },
  { left: '63%', delay: '-8s',  dur: '16s', dx: '-15px', dx2: '8px',   size: 2, op: 0.5 },
  { left: '74%', delay: '-2s',  dur: '26s', dx: '25px',  dx2: '-18px', size: 4, op: 0.4 },
  { left: '83%', delay: '-14s', dur: '19s', dx: '-10px', dx2: '15px',  size: 2, op: 0.35 },
  { left: '91%', delay: '-6s',  dur: '23s', dx: '12px',  dx2: '-20px', size: 3, op: 0.45 },
  { left: '33%', delay: '-20s', dur: '30s', dx: '-18px', dx2: '10px',  size: 2, op: 0.3 },
  { left: '58%', delay: '-9s',  dur: '21s', dx: '22px',  dx2: '-14px', size: 3, op: 0.5 },
  { left: '46%', delay: '-13s', dur: '25s', dx: '-8px',  dx2: '18px',  size: 2, op: 0.4 },
];

export default function Background() {
  return (
    <div className="bg-scene" aria-hidden="true">
      {/* Deep gradient orbs — green (dragonfire), purple (shadow), amber (ember glow) */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Rising ember particles */}
      <div className="bg-embers">
        {EMBERS.map((e, i) => (
          <div
            key={i}
            className="bg-ember"
            style={{
              left: e.left,
              bottom: '-10px',
              width: e.size,
              height: e.size,
              background: i % 3 === 0
                ? 'rgba(249,115,22,0.9)'   // orange ember
                : i % 3 === 1
                  ? 'rgba(52,211,153,0.7)' // green spark
                  : 'rgba(248,113,113,0.6)', // red ash
              boxShadow: i % 3 === 0
                ? '0 0 4px 1px rgba(249,115,22,0.4)'
                : i % 3 === 1
                  ? '0 0 4px 1px rgba(52,211,153,0.3)'
                  : '0 0 3px 1px rgba(248,113,113,0.3)',
              '--dx': e.dx,
              '--dx2': e.dx2,
              '--op': e.op,
              animationDelay: e.delay,
              animationDuration: e.dur,
            }}
          />
        ))}
      </div>
    </div>
  );
}
