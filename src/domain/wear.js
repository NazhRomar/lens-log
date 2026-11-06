import { startOfDay } from 'date-fns';

const HOUR = 60 * 60 * 1000;

/** Milliseconds a session has run (up to now if still open). */
export function sessionDuration(session, now) {
  const end = session.endedAt ?? now;
  return Math.max(0, end - session.startedAt);
}

/** Total wear time today, counting only the part of each session after midnight. */
export function wornToday(sessions, now) {
  const midnight = startOfDay(now).getTime();
  return sessions.reduce((sum, s) => {
    const start = Math.max(s.startedAt, midnight);
    const end = s.endedAt ?? now;
    return end > start ? sum + (end - start) : sum;
  }, 0);
}

/** 'ok' | 'near' (within 1h of max) | 'over' */
export function wearState(ms, maxHours) {
  if (ms >= maxHours * HOUR) return 'over';
  if (ms >= (maxHours - 1) * HOUR) return 'near';
  return 'ok';
}

/**
 * True when an open session has run well past the max (by `graceHours`):
 * the user probably took the lenses out and forgot to log it, or slept in them.
 */
export function isLikelyForgotten(session, now, maxHours, graceHours = 4) {
  return !session.endedAt && now - session.startedAt > (maxHours + graceHours) * HOUR;
}

export { HOUR };

/** "6h 42m" */
export function formatDuration(ms) {
  const totalMin = Math.floor(Math.max(0, ms) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
