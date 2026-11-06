import { useState } from 'react';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import { setSupply } from '../../db/actions';
import { openedAtFromDate } from '../../domain/cycles';
import { SUPPLY_DEFAULTS, supplyStatus } from '../../domain/supplies';

const BAR = { ok: 'bg-accent', soon: 'bg-warn-bar', overdue: 'bg-danger' };
const TRACK = { ok: 'bg-track', soon: 'bg-warn-soft', overdue: 'bg-danger-soft' };
const TEXT = { ok: 'text-muted', soon: 'text-warn font-semibold', overdue: 'text-danger font-semibold' };

function statusText(s, verb) {
  if (s.daysLeft > 0) return `${s.daysLeft} ${s.daysLeft === 1 ? 'day' : 'days'} left`;
  if (s.daysLeft === 0) return `${verb} today`;
  return `${-s.daysLeft} ${s.daysLeft === -1 ? 'day' : 'days'} overdue`;
}

/** Tracker for the lens case or solution bottle, with an inline form to start or correct it. */
export default function SupplyCard({ id, supply, now, last }) {
  const def = SUPPLY_DEFAULTS[id];
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState('');
  const [days, setDays] = useState(def.discardAfterDays);

  function startEdit() {
    setDate(format(supply?.openedAt ?? Date.now(), 'yyyy-MM-dd'));
    setDays(supply?.discardAfterDays ?? def.discardAfterDays);
    setEditing(true);
  }

  async function save(e) {
    e.preventDefault();
    await setSupply(id, { openedAt: openedAtFromDate(date), discardAfterDays: days });
    setEditing(false);
  }

  const wrap = `flex flex-col gap-3 p-4 ${last ? '' : 'border-b border-line'}`;
  const headingId = `supply-${id}`;

  if (editing) {
    return (
      <form onSubmit={save} aria-labelledby={headingId} className={wrap}>
        <h3 id={headingId} className="m-0 text-[15px] font-semibold">
          {def.label}
        </h3>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Opened on
          <input
            type="date"
            required
            value={date}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg"
          />
        </label>
        <Stepper
          id={`${id}-days`}
          label={`${def.verb} after`}
          value={days}
          min={def.minDays}
          max={def.maxDays}
          unit="days"
          onChange={setDays}
        />
        <p className="m-0 text-sm leading-relaxed text-muted">{def.hint}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="text-fg" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    );
  }

  if (!supply) {
    return (
      <div className={wrap}>
        <h3 id={headingId} className="m-0 text-[15px] font-semibold">
          {def.label}
        </h3>
        <p className="m-0 text-sm leading-relaxed text-muted">Not tracked yet. {def.hint}</p>
        <Button variant="secondary" onClick={startEdit}>
          Start tracking
        </Button>
      </div>
    );
  }

  const s = supplyStatus(supply, now);
  const pct = Math.round(s.progress * 100);

  return (
    <div className={wrap}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="m-0 text-[15px] font-semibold">
          {def.label}
        </h3>
        <span className={`text-[13px] ${TEXT[s.state]}`}>{statusText(s, def.verb)}</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={headingId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={`h-1.5 overflow-hidden rounded-full ${TRACK[s.state]}`}
      >
        <div className={`h-full rounded-full ${BAR[s.state]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted">
          Opened {format(supply.openedAt, 'MMM d')} · {def.verb.toLowerCase()} after {supply.discardAfterDays} days
        </span>
        <button
          type="button"
          onClick={startEdit}
          className="min-h-11 flex-none cursor-pointer border-0 bg-transparent px-1 text-sm font-semibold text-accent"
        >
          Edit
        </button>
      </div>
      {s.state !== 'ok' && (
        <Button
          variant="secondary"
          onClick={() => setSupply(id, { openedAt: Date.now(), discardAfterDays: supply.discardAfterDays })}
        >
          {def.newLabel} opened today
        </Button>
      )}
    </div>
  );
}
