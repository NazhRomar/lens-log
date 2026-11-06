import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const DAY = 24 * 60 * 60 * 1000;

/** Open lens cycles keyed by eye: { left, right } (either may be undefined). undefined while loading. */
export function useActiveCycles() {
  return useLiveQuery(async () => {
    const open = await db.cycles.filter((c) => c.closedAt == null).toArray();
    return {
      left: open.find((c) => c.eye === 'left'),
      right: open.find((c) => c.eye === 'right'),
    };
  }, []);
}

/** The session currently being worn, or null. undefined while loading. */
export function useActiveSession() {
  return useLiveQuery(async () => (await db.sessions.filter((s) => s.endedAt == null).first()) ?? null, []);
}

/** Sessions started in the last 2 days (enough to total up "today"). */
export function useRecentSessions() {
  return useLiveQuery(() => db.sessions.where('startedAt').above(Date.now() - 2 * DAY).toArray(), []);
}

/** { case, solution } supply rows (either may be undefined). */
export function useSupplies() {
  return useLiveQuery(async () => {
    const rows = await db.supplies.toArray();
    return Object.fromEntries(rows.map((r) => [r.id, r]));
  }, []);
}

/** { left, right } stock rows. */
export function useStock() {
  return useLiveQuery(async () => {
    const rows = await db.stock.toArray();
    return Object.fromEntries(rows.map((r) => [r.eye, r]));
  }, []);
}
