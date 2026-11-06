import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { addDays, format, isToday, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import Card from '../../components/ui/Card';
import { db } from '../../db/db';
import { HOUR, formatDuration, wornOnDay } from '../../domain/wear';

const CHART_H = 140;

function useSessionsBetween(from, to) {
  // Start a day early so sessions that cross midnight into the range are included.
  return useLiveQuery(
    () => db.sessions.where('startedAt').between(from - 24 * HOUR, to).toArray(),
    [from, to],
  );
}

function weekTitle(offset, first, last) {
  if (offset === 0) return 'This week';
  if (offset === 1) return 'Last week';
  return `${format(first, 'MMM d')} – ${format(last, 'MMM d')}`;
}

const NAV =
  'flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-fg disabled:cursor-not-allowed disabled:opacity-30';

/** Seven days of wear time ending today (or earlier weeks), with the daily limit line. */
export default function WearChart({ now, maxHours }) {
  const [offset, setOffset] = useState(0);
  const last = startOfDay(addDays(now, -7 * offset));
  const first = addDays(last, -6);
  const sessions = useSessionsBetween(first.getTime(), addDays(last, 1).getTime());

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(first, i);
    const ms = sessions ? wornOnDay(sessions, day, now) : 0;
    return { day, ms, today: isToday(day), over: ms > maxHours * HOUR };
  });

  const scaleHours = Math.max(maxHours + 2, ...days.map((d) => Math.ceil(d.ms / HOUR)));
  const px = (ms) => (ms / (scaleHours * HOUR)) * CHART_H;
  const worn = days.filter((d) => d.ms > 0);
  const avg = worn.length ? worn.reduce((s, d) => s + d.ms, 0) / worn.length : 0;
  const overDays = days.filter((d) => d.over);

  return (
    <Card aria-labelledby="week-h" className="flex flex-col gap-4 p-4">
      <div className="-mx-1 flex items-center justify-between">
        <button type="button" aria-label="Previous week" onClick={() => setOffset(offset + 1)} className={NAV}>
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 id="week-h" className="m-0 text-[15px] font-semibold">
            {weekTitle(offset, first, last)}
          </h2>
          <span className="text-[13px] text-muted">
            {worn.length ? `Avg ${formatDuration(avg)} on days worn` : 'No wear logged'}
          </span>
        </div>
        <button
          type="button"
          aria-label="Next week"
          disabled={offset === 0}
          onClick={() => setOffset(offset - 1)}
          className={NAV}
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>

      <div className="relative" style={{ height: CHART_H }}>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 border-t border-dashed border-danger"
          style={{ bottom: px(maxHours * HOUR) }}
        />
        <span
          aria-hidden="true"
          className="absolute right-0 text-[11px] font-semibold text-danger"
          style={{ bottom: px(maxHours * HOUR) + 4 }}
        >
          {maxHours}h max
        </span>
        <ol className="absolute inset-0 m-0 grid list-none grid-cols-7 items-end gap-2.5 p-0">
          {days.map((d) => (
            <li key={d.day.getTime()} className="flex h-full flex-col justify-end">
              <span className="sr-only">
                {format(d.day, 'EEEE')}: {d.ms ? formatDuration(d.ms) : 'not worn'}
                {d.over ? ', over the limit' : ''}
              </span>
              <span
                aria-hidden="true"
                className={`block rounded-t-md rounded-b-sm ${
                  d.over ? 'bg-danger' : d.ms === 0 ? 'bg-track' : d.today ? 'bg-accent/45' : 'bg-accent'
                }`}
                style={{ height: Math.max(d.ms ? 4 : 2, px(d.ms)) }}
              />
            </li>
          ))}
        </ol>
      </div>

      <div aria-hidden="true" className="grid grid-cols-7 gap-2.5">
        {days.map((d) => (
          <span
            key={d.day.getTime()}
            className={`text-center text-xs ${d.today ? 'font-bold text-fg' : 'font-medium text-muted'}`}
          >
            {d.today ? 'Today' : format(d.day, 'EEE')}
          </span>
        ))}
      </div>

      {overDays.length > 0 && (
        <div className="flex gap-2.5 rounded-xl bg-danger-soft p-3 text-[13px] leading-normal text-danger-strong">
          <TriangleAlert aria-hidden="true" size={18} className="mt-px flex-none" />
          <span>
            Over your {maxHours}h limit on{' '}
            {overDays.map((d) => `${format(d.day, 'EEEE')} (${formatDuration(d.ms)})`).join(', ')}.
          </span>
        </div>
      )}
    </Card>
  );
}
