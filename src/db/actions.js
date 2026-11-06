import { db } from './db';
import { cancelAll, ensurePermission } from '../platform/notifications';
import { syncReminders } from '../platform/reminders';
import { clearWidget } from '../platform/widget';

/** Deletes everything on this device, cancels reminders and restarts at setup. */
export async function resetAllData() {
  await cancelAll().catch(() => {});
  await clearWidget();
  db.close();
  await db.delete();
  window.location.replace('/');
}

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
 * @param {{eyes:('left'|'right')[], openedAt:number, reason?:'scheduled'|'damaged'|'lost', useStock?:boolean}} opts
 */
export async function openLenses({ eyes, openedAt, reason = 'scheduled', useStock = true }) {
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
      if (!useStock) continue;
      const stock = await db.stock.get(eye);
      if (stock && stock.count > 0) await db.stock.update(eye, { count: stock.count - 1 });
    }
  });
  await ensurePermission().catch(() => false);
  await syncReminders();
}

/** Sets the spare-lens count for one eye. */
export async function setStock(eye, count) {
  await db.stock.update(eye, { count: Math.max(0, count) });
}

/**
 * Starts or corrects tracking of the lens case or solution bottle.
 * @param {'case'|'solution'} id
 * @param {{openedAt:number, discardAfterDays:number}} data
 */
export async function setSupply(id, { openedAt, discardAfterDays }) {
  await db.supplies.put({ id, openedAt, discardAfterDays });
  await syncReminders();
}

/**
 * Saves both prescriptions and the lens brand.
 * @param {{left:object, right:object, brand:string}} data
 */
export async function savePrescriptions({ left, right, brand }) {
  await db.transaction('rw', db.prescriptions, db.settings, async () => {
    await db.prescriptions.put({ ...left, eye: 'left' });
    await db.prescriptions.put({ ...right, eye: 'right' });
    await db.settings.update('settings', { brand: brand.trim() });
  });
}

/**
 * Changes the lens type. Lenses already open switch to the new schedule too,
 * so fixing a wrong choice updates the countdown right away.
 */
export async function updateLensSchedule({ lensType, replacementDays }) {
  await db.transaction('rw', db.settings, db.cycles, async () => {
    await db.settings.update('settings', { lensType, replacementDays });
    await db.cycles.filter((c) => c.closedAt == null).modify({ replacementDays });
  });
  await syncReminders();
}

/**
 * Saves the onboarding answers. `onboarded` is set last so Home appears with everything in place.
 * @param {{settings:object, openedAt:number|null, stock:{left:number,right:number}}} answers
 */
export async function completeOnboarding({ settings, openedAt, stock }) {
  await db.transaction('rw', db.settings, db.stock, async () => {
    await db.settings.update('settings', settings);
    await db.stock.update('left', { count: stock.left });
    await db.stock.update('right', { count: stock.right });
  });
  if (openedAt) {
    // The lenses in your eyes are from an already-open pack, not from the spares counted in stock.
    await openLenses({ eyes: ['left', 'right'], openedAt, useStock: false });
  }
  await db.settings.update('settings', { onboarded: true });
  await syncReminders();
}
