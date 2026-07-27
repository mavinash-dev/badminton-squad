// GoT-inspired SVG icon set — no emoji

export function SwordSVG({ size = 24, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      {/* blade */}
      <path d="M5 19L18 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* tip point */}
      <path d="M18 4L20 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* crossguard */}
      <path d="M13.5 8.5L16 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 11L13.5 8.5" stroke={color} strokeWidth="0" />
      <path d="M14.5 7.5L12 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0" />
      <line x1="11" y1="12" x2="15" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* grip */}
      <path d="M5 19L3 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* pommel */}
      <circle cx="3" cy="21" r="1.2" fill={color} />
    </svg>
  );
}

export function CrossedSwordsSVG({ size = 28, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" style={style}>
      {/* sword 1: top-left to bottom-right */}
      <line x1="4" y1="4" x2="24" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="24" r="1.2" fill={color} />
      <line x1="4" y1="4" x2="2" y2="2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10" y1="10" x2="7" y2="13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="13" y2="7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* sword 2: top-right to bottom-left */}
      <line x1="24" y1="4" x2="4" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4" cy="24" r="1.2" fill={color} />
      <line x1="24" y1="4" x2="26" y2="2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="10" x2="21" y2="13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="18" y1="10" x2="15" y2="7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function CrownSVG({ size = 28, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" style={style}>
      {/* crown base */}
      <rect x="4" y="18" width="20" height="4" rx="1" fill={color} opacity="0.9" />
      {/* crown points */}
      <polyline
        points="4,18 4,8 9,13 14,6 19,13 24,8 24,18"
        fill={color}
        opacity="0.9"
        strokeLinejoin="round"
      />
      {/* jewels */}
      <circle cx="14" cy="9" r="1.3" fill="var(--canvas)" opacity="0.6" />
      <circle cx="8" cy="14" r="1" fill="var(--canvas)" opacity="0.5" />
      <circle cx="20" cy="14" r="1" fill="var(--canvas)" opacity="0.5" />
    </svg>
  );
}

export function ShieldSVG({ size = 28, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" style={style}>
      <path
        d="M14 3L4 7V14C4 19.5 8.5 24 14 26C19.5 24 24 19.5 24 14V7L14 3Z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
        fill={color} fillOpacity="0.12"
      />
      {/* emblem line */}
      <line x1="14" y1="9" x2="14" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <line x1="9" y1="14" x2="19" y2="14" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function DragonSVG({ size = 36, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" style={style}>
      {/* body */}
      <path d="M24 36C16 36 8 30 8 22C8 15 14 10 22 10C25 10 27 11 28 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* neck + head */}
      <path d="M28 12C32 10 38 12 40 16C42 20 40 24 36 24C33 24 31 22 30 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* snout */}
      <path d="M40 16L44 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* fire breath */}
      <path d="M44 14L47 12M44 14L46 16M44 14L47 15" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      {/* wing */}
      <path d="M22 16C20 10 14 6 8 8C12 10 14 14 16 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M16 18C12 14 6 14 4 18C8 16 12 18 16 18" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* tail */}
      <path d="M8 22C6 28 8 34 12 36C10 32 10 28 12 26" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* eye */}
      <circle cx="37" cy="18" r="1.5" fill={color} />
      {/* spines */}
      <path d="M20 12L18 8M24 10L23 6M28 12L28 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function FlamesSVG({ size = 24, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      <path d="M12 22C7 22 4 18 4 14C4 10 7 8 8 6C8 9 10 10 10 10C10 8 11 5 14 3C13 7 15 8 15 10C16 8 16 6 15 4C19 6 20 10 20 13C20 18 17 22 12 22Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"
        fill={color} fillOpacity="0.15"
      />
      <path d="M12 22C10 20 9 17 10 14C11 16 13 16 13 14C14 16 15 19 14 22"
        stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" fill="none"
      />
    </svg>
  );
}

export function HourglassSVG({ size = 20, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={style}>
      <path d="M4 3H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 17H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 3L10 10L15 3" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill={color} fillOpacity="0.15" />
      <path d="M5 17L10 10L15 17" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

export function ScrollSVG({ size = 20, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={style}>
      <rect x="4" y="3" width="12" height="15" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
      <path d="M4 5C4 4 3 3 3 5V15C3 17 4 17 4 16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7" y1="7" x2="13" y2="7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="13" x2="11" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
