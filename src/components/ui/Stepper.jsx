import { Minus, Plus } from 'lucide-react';

const BTN =
  'flex size-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-surface text-fg shadow-sm disabled:cursor-not-allowed disabled:opacity-40';

/** Number input as − value + buttons. */
export default function Stepper({ id, label, value, min, max, step = 1, unit, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <div role="group" aria-labelledby={`${id}-label`} className="flex items-center justify-between rounded-[14px] bg-bg p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
          className={BTN}
        >
          <Minus aria-hidden="true" size={20} />
        </button>
        <output aria-live="polite" className="text-lg font-bold tabular-nums">
          {value} {unit && <span className="text-sm font-medium text-muted">{unit}</span>}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
          className={BTN}
        >
          <Plus aria-hidden="true" size={20} />
        </button>
      </div>
    </div>
  );
}
