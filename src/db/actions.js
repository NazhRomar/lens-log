import { db } from './db';
import { ensurePermission } from '../platform/notifications';
import { syncReminders } from '../platform/reminders';

// Every change that affects a reminder goes through here, so reminders are
// re-synced right after the database is updated.

async function getActiveSession() {
  return db.sessions.filter((s) => s.endedAt == null).first();
}

/** Starts a wear session now. Does nothing if one is already running. */
export async function putIn() {
  if (await getActiveSession()) return;
  await db.sessions.add({ startedAt: Date.now(), endedAt: null, endedEstimated: false });
  await ensurePermission().catch(() => false);
  await syncReminders();
}

/**
 * Ends the running wear session.
 * @param {number} [at] when the lenses came out (defaults to now; clamped between start and now)
 * @param {boolean} [estimated] true when the user filled in the time afterwards
 */
export async function takeOut(at = Date.now(), estimated = false) {
  const active = await getActiveSession();
  if (!active) return;
  const endedAt = Math.min(Date.now(), Math.max(active.startedAt, at));
  await db.sessions.update(active.id, { endedAt, endedEstimated: estimated });
  await syncReminders();
}

/**
 * Starts new lenses for the given eyes: closes each eye's current lens,
 * opens a new one, and takes one lens per eye from stock.
 * @param {{eyes:('left'|'right')[], openedAt:number, reason?:'scheduled'|'damaged'|'lost'}} opts
 */
export async function openLenses({ eyes, openedAt, reason = 'scheduled' }) {
  const now = Date.now();
  await db.transaction('rw', db.cycles, db.stock, db.settings, async () => {
    const settings = await db.settings.get('settings');
    for (const eye of eyes) {
      const current = await db.cycles.filter((c) => c.eye === eye && c.closedAt == null).first();
      if (current) await db.cycles.update(current.id, { closedAt: now, closeReason: reason });
      await db.cycles.add({
        eye,
        openedAt,
        replacementDays: settings.replacementDays,
        closedAt: null,
        closeReason: null,
      });
      const stock = await db.stock.get(eye);
      if (stock && stock.count > 0) await db.stock.update(eye, { count: stock.count - 1 });
    }
  });
  await ensurePermission().catch(() => false);
  await syncReminders();
}
