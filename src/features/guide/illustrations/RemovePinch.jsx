/** Taking a lens out: eye looking up, lens slid down onto the white of the eye, pinched between two fingertips. */
export default function RemovePinch() {
  return (
    <svg
      role="img"
      aria-label="An eye looking up with the lens slid down onto the white of the eye. Thumb and index finger gently pinch the lens off."
      viewBox="0 0 350 220"
      className="h-auto w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id="remove-eye">
          <path d="M60 105 Q175 20 290 105 Q175 190 60 105Z" />
        </clipPath>
      </defs>

      <text x="175" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--muted)">
        Look up · slide down · pinch
      </text>

      {/* eye, looking up: iris partly under the upper lid */}
      <path d="M60 105 Q175 20 290 105 Q175 190 60 105Z" fill="var(--surface)" />
      <g clipPath="url(#remove-eye)">
        <circle cx="175" cy="72" r="28" fill="var(--track)" stroke="var(--skin-line)" strokeWidth="2" />
        <circle cx="175" cy="72" r="11" fill="var(--fg)" fillOpacity="0.75" />
      </g>
      <path d="M60 105 Q175 20 290 105 Q175 190 60 105Z" stroke="var(--skin-line)" strokeWidth="2.5" />

      {/* lens, slid down onto the white of the eye */}
      <circle cx="175" cy="120" r="28" fill="var(--accent)" fillOpacity="0.1" stroke="var(--accent)" strokeWidth="3" />

      {/* index finger (left) and thumb (right): outline stroke under a skin-colored stroke */}
      <line x1="60" y1="250" x2="142" y2="132" stroke="var(--skin-line)" strokeWidth="28" />
      <line x1="60" y1="250" x2="142" y2="132" stroke="var(--skin)" strokeWidth="24" />
      <line x1="290" y1="250" x2="208" y2="132" stroke="var(--skin-line)" strokeWidth="28" />
      <line x1="290" y1="250" x2="208" y2="132" stroke="var(--skin)" strokeWidth="24" />
    </svg>
  );
}
