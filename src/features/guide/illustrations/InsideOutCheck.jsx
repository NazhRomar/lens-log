/** Correct lens (bowl) vs inside-out lens (flared edge), each on a fingertip. Colors follow the theme. */
export default function InsideOutCheck() {
  return (
    <svg
      role="img"
      aria-label="Two lenses on fingertips seen from the side. Left: correct, a smooth bowl with edges pointing up. Right: inside out, the edges flare outward."
      viewBox="0 0 350 220"
      className="h-auto w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="175" y1="20" x2="175" y2="200" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 6" />

      <circle cx="95" cy="32" r="14" fill="var(--ok-soft)" />
      <path d="M88 32.5 93 37.5 102 27.5" stroke="var(--ok)" strokeWidth="2.5" />
      <text x="95" y="68" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ok)">
        Correct: bowl
      </text>
      <path d="M62 222 V172 a33 33 0 0 1 66 0 V222" fill="var(--skin)" stroke="var(--skin-line)" strokeWidth="2" />
      <path d="M54 104 C 56 146, 134 146, 136 104" fill="var(--accent)" fillOpacity="0.08" stroke="var(--accent)" strokeWidth="3" />
      <path d="M60 106 C 64 136, 126 136, 130 106" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1.5" />

      <circle cx="255" cy="32" r="14" fill="var(--danger-soft)" />
      <path d="M249 26 261 38 M261 26 249 38" stroke="var(--danger)" strokeWidth="2.5" />
      <text x="255" y="68" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--danger)">
        Inside out: flared
      </text>
      <path d="M222 222 V172 a33 33 0 0 1 66 0 V222" fill="var(--skin)" stroke="var(--skin-line)" strokeWidth="2" />
      <path
        d="M200 104 C 214 106, 220 140, 255 140 C 290 140, 296 106, 310 104"
        fill="var(--accent)"
        fillOpacity="0.08"
        stroke="var(--accent)"
        strokeWidth="3"
      />
      <path d="M206 99 l-8 4 8 4 M304 99 l8 4 -8 4" stroke="var(--danger)" strokeWidth="2" />
    </svg>
  );
}
