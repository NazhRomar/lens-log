import { useLiveQuery } from 'dexie-react-hooks';
import { format, isSameYear } from 'date-fns';
import Card from '../../components/ui/Card';
import { db } from '../../db/db';
import { cycleOutcome, groupClosedCycles } from '../../domain/cycles';

const BADGE = {
  onTime: ['On time', 'bg-ok-soft text-ok'],
  late: ['Late', 'bg-danger-soft text-danger'],
  damaged: ['Torn', 'bg-warn-soft text-warn'],
  lost: ['Lost', 'bg-bg text-muted'],
};

const EYE = { left: 'L', right: 'R', both: 'L+R' };
const EYE_NAME = { left: 'Left eye', right: 'Right eye', both: 'Both eyes' };

function dateRange(a, b) {
  const fmt = (d) => format(d, isSameYear(d, Date.now()) ? 'MMM d' : 'MMM d, yyyy');
  return `${fmt(a)} – ${fmt(b)}`;
}

function detail(o, total) {
  const used = `${o.daysUsed} of ${total} days`;
  if (o.outcome === 'late') return `${used} · ${o.daysLate} ${o.daysLate === 1 ? 'day' : 'days'} late`;
  if (o.outcome === 'damaged' || o.outcome === 'lost') return `${used} · replaced early`;
  return used;
}

export default function PastLenses() {
  const closed = useLiveQuery(() => db.cycles.filter((c) => c.closedAt != null).toArray(), []);
  if (closed === undefined) return null;
  const entries = groupClosedCycles(closed);

  return (
    <section aria-labelledby="past-h" className="flex flex-col gap-2">
      <h2 id="past-h" className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
        Past lenses
      </h2>
      {entries.length === 0 ? (
        <Card className="p-4">
          <p className="m-0 text-sm leading-relaxed text-muted">
            Lenses you replace will show up here, with how long you wore them.
          </p>
        </Card>
      ) : (
        <ul className="m-0 list-none overflow-hidden rounded-[20px] border border-line bg-surface p-0">
          {entries.map((c) => {
            const o = cycleOutcome(c);
            const [label, cls] = BADGE[o.outcome];
            return (
              <li key={c.id} className="flex items-center gap-3.5 border-b border-line px-4 py-3.5 last:border-b-0">
                <span
                  aria-label={EYE_NAME[c.eye]}
                  className="flex h-9 min-w-9 flex-none items-center justify-center rounded-[10px] bg-bg px-1.5 text-[13px] font-bold text-fg-soft"
                >
                  {EYE[c.eye]}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{dateRange(c.openedAt, c.closedAt)}</span>
                  <span className="text-[13px] text-muted">{detail(o, c.replacementDays)}</span>
                </span>
                <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
