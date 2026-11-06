import { addDays, differenceInCalendarDays, isToday, parse, setHours, startOfDay } from 'date-fns';

/** A date input value (yyyy-MM-dd) → timestamp: now if it is today, otherwise noon that day. */
export function openedAtFromDate(dateStr) {
  const day = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isToday(day) ? Date.now() : setHours(day, 12).getTime();
}

export const SOON_DAYS = 2;

/**
 * Status of one opened lens.
 * Day 1 is the day the pack was opened. A 14-day lens opened Oct 25 is worn
 * Oct 25 – Nov 7: on Nov 6 it is day 13 with 2 days left, and on Nov 8
 * (`replaceBy`) a new lens is due.
 *
 * state: 'ok' | 'soon' (≤ 2 days left) | 'due' (replace today) | 'overdue'
 *
 * @param {{openedAt:number, replacementDays:number}} cycle
 * @param {number|Date} now
 * @param {{countMode?:'calendar'|'wearDays', wearDays?:number}} [opts]
 */
export function cycleStatus(cycle, now, opts = {}) {
  const total = cycle.replacementDays;
  const day =
    opts.countMode === 'wearDays' && typeof opts.wearDays === 'number'
      ? opts.wearDays
      : differenceInCalendarDays(now, cycle.openedAt) + 1;
  const daysLeft = total - day + 1;
  const replaceBy = startOfDay(addDays(cycle.openedAt, total));

  let state = 'ok';
  if (daysLeft < 0) state = 'overdue';
  else if (daysLeft === 0) state = 'due';
  else if (daysLeft <= SOON_DAYS) state = 'soon';

  return { day, total, daysLeft, replaceBy, state, progress: Math.min(1, day / total) };
}

/**
 * How a finished lens ended.
 * outcome: 'onTime' | 'late' | 'damaged' | 'lost'
 */
export function cycleOutcome(cycle) {
  const daysUsed = differenceInCalendarDays(cycle.closedAt, cycle.openedAt);
  const replaceBy = addDays(cycle.openedAt, cycle.replacementDays);
  const daysLate = differenceInCalendarDays(cycle.closedAt, replaceBy);
  let outcome = 'onTime';
  if (cycle.closeReason === 'damaged') outcome = 'damaged';
  else if (cycle.closeReason === 'lost') outcome = 'lost';
  else if (daysLate > 0) outcome = 'late';
  return { outcome, daysUsed: Math.max(1, daysUsed), daysLate: Math.max(0, daysLate) };
}

/**
 * Finished lenses, newest first. Both eyes replaced together with the same
 * dates and reason become one entry with eye 'both'.
 */
export function groupClosedCycles(cycles) {
  const sorted = [...cycles].sort((a, b) => b.closedAt - a.closedAt);
  const out = [];
  for (const c of sorted) {
    const pair = out.find(
      (g) =>
        g.eye !== 'both' &&
        g.eye !== c.eye &&
        Math.abs(g.closedAt - c.closedAt) < 60_000 &&
        g.closeReason === c.closeReason &&
        sameSchedule(g, c),
    );
    if (pair) pair.eye = 'both';
    else out.push({ ...c });
  }
  return out;
}

/** True when both eyes were opened the same day with the same schedule, so they can be shown as one. */
export function sameSchedule(a, b) {
  return (
    !!a &&
    !!b &&
    a.replacementDays === b.replacementDays &&
    differenceInCalendarDays(a.openedAt, b.openedAt) === 0
  );
}

/** Number of distinct calendar days with a wear session since the lens was opened. */
export function wearDaysSince(openedAt, sessions) {
  const days = new Set();
  for (const s of sessions) {
    if (s.startedAt >= startOfDay(openedAt).getTime()) {
      days.add(startOfDay(s.startedAt).getTime());
    }
  }
  return days.size;
}
