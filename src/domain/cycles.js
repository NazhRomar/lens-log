import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

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
