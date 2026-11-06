import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { db } from '../db/db';
import { cycleStatus, sameSchedule } from '../domain/cycles';
import { supplyStatus } from '../domain/supplies';
import { HOUR } from '../domain/wear';
import { IDS, cancel, schedule } from './notifications';
import { isNative } from './native';

const DUE_AT = { hour: 7, minute: 30 }; // morning of the replacement day
const SOON_AT = { hour: 20, minute: 0 }; // evening before

function atTime(day, { hour, minute }) {
  return setMinutes(setHours(startOfDay(day), hour), minute);
}

async function syncReplacement(settings, now) {
  await cancel(IDS.replaceLeft, IDS.replaceRight, IDS.replaceLeftSoon, IDS.replaceRightSoon);
  if (settings.replacementDays <= 1) return; // daily lenses: nothing to count down

  const open = await db.cycles.filter((c) => c.closedAt == null).toArray();
  const left = open.find((c) => c.eye === 'left');
  const right = open.find((c) => c.eye === 'right');

  // One notification for both eyes when they share a schedule, otherwise one per eye.
  const groups = sameSchedule(left, right)
    ? [{ cycle: left, ids: [IDS.replaceLeft, IDS.replaceLeftSoon], what: 'lenses', both: true }]
    : [
        left && { cycle: left, ids: [IDS.replaceLeft, IDS.replaceLeftSoon], what: 'left lens' },
        right && { cycle: right, ids: [IDS.replaceRight, IDS.replaceRightSoon], what: 'right lens' },
      ].filter(Boolean);

  for (const { cycle, ids, what, both } of groups) {
    const { replaceBy } = cycleStatus(cycle, now);
    const [dueId, soonId] = ids;
    await schedule({
      id: dueId,
      at: atTime(replaceBy, DUE_AT),
      title: `New ${what} today`,
      body: both ? 'Your lenses are due. Open a fresh pair for both eyes.' : `Your ${what} is due. Open a fresh one.`,
    });
    if (settings.replacementDays > 2) {
      await schedule({
        id: soonId,
        at: atTime(addDays(replaceBy, -1), SOON_AT),
        title: `New ${what} tomorrow`,
        body: 'Make sure you have a fresh pack ready.',
      });
    }
  }
}

async function syncWear(settings) {
  await cancel(IDS.wearNear, IDS.wearMax);
  const active = await db.sessions.filter((s) => s.endedAt == null).first();
  if (!active) return;
  const max = settings.maxWearHours;
  await schedule({
    id: IDS.wearNear,
    at: active.startedAt + (max - 1) * HOUR,
    title: '1 hour of wear left',
    body: `You've had your lenses in for ${max - 1} hours.`,
  });
  await schedule({
    id: IDS.wearMax,
    at: active.startedAt + max * HOUR,
    title: 'Time to take your lenses out',
    body: `You've reached your ${max}-hour limit.`,
  });
}

const SUPPLY_AT = { hour: 9, minute: 0 };
const SUPPLY_TEXT = {
  case: { id: IDS.caseReplace, title: 'Time for a new lens case', body: 'Your lens case is due for replacement.' },
  solution: {
    id: IDS.solutionDiscard,
    title: 'Time for fresh solution',
    body: 'Your solution bottle has been open too long. Open a new one.',
  },
};

async function syncSupplies(now) {
  await cancel(IDS.caseReplace, IDS.solutionDiscard);
  for (const supply of await db.supplies.toArray()) {
    const text = SUPPLY_TEXT[supply.id];
    if (!text) continue;
    await schedule({ ...text, at: atTime(supplyStatus(supply, now).replaceBy, SUPPLY_AT) });
  }
}

/**
 * Rebuilds every scheduled reminder from what is in the database.
 * Safe to call any time; never throws (a failed reminder must not break the app).
 */
export async function syncReminders() {
  if (!isNative) return;
  try {
    const settings = await db.settings.get('settings');
    if (!settings) return;
    const now = Date.now();
    await syncReplacement(settings, now);
    await syncWear(settings);
    await syncSupplies(now);
  } catch (err) {
    console.warn('Could not schedule reminders', err);
  }
}
