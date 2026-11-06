const R = 34;
const C = 2 * Math.PI * R;

/** Circular progress (0–1) with content in the middle. Colors are Tailwind stroke classes. */
export default function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 7,
  colorClass = 'stroke-accent',
  trackClass = 'stroke-track',
  label,
  children,
}) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg role="img" aria-label={label} width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={R} fill="none" className={trackClass} strokeWidth={strokeWidth} />
        {p > 0 && (
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            className={colorClass}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${C * p} ${C}`}
            transform="rotate(-90 40 40)"
          />
        )}
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
