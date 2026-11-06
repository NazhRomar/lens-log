/** Lens case after cleaning: both cups upside down on a clean tissue, caps off, air-drying. */
export default function CaseDry() {
  return (
    <svg
      role="img"
      aria-label="A lens case after cleaning: the left and right cups sit upside down on a clean tissue with their caps off, air-drying."
      viewBox="0 0 350 220"
      className="h-auto w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <text x="175" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--muted)">
        Rinse with solution · air-dry upside down
      </text>

      {/* air */}
      <path d="M90 82 q7 -7 0 -14 q-7 -7 0 -14" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M110 82 q7 -7 0 -14 q-7 -7 0 -14" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M180 82 q7 -7 0 -14 q-7 -7 0 -14" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M200 82 q7 -7 0 -14 q-7 -7 0 -14" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="2" />

      {/* tissue */}
      <path d="M30 170 H320 L300 196 H50 Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />

      {/* cups, upside down */}
      <path d="M62 170 V120 a38 30 0 0 1 76 0 V170 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2.5" />
      <path d="M152 170 V120 a38 30 0 0 1 76 0 V170 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2.5" />
      <text x="100" y="152" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--accent)">
        L
      </text>
      <text x="190" y="152" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--accent)">
        R
      </text>

      {/* caps, lying open */}
      <ellipse cx="272" cy="150" rx="30" ry="9" fill="var(--surface)" stroke="var(--skin-line)" strokeWidth="2" />
      <path d="M242 150 v10 a30 9 0 0 0 60 0 v-10" stroke="var(--skin-line)" strokeWidth="2" />
      <ellipse cx="268" cy="118" rx="30" ry="9" fill="var(--surface)" stroke="var(--skin-line)" strokeWidth="2" />
      <path d="M238 118 v10 a30 9 0 0 0 60 0 v-10" stroke="var(--skin-line)" strokeWidth="2" />
    </svg>
  );
}
