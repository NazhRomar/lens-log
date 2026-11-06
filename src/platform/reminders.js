import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { syncWidget } from './widget';
import { db } from '../db/db';
import { cycleStatus, sameSchedule } from '../domain/cycles';
import { supplyStatus } from '../domain/supplies';
import { HOUR, wornOnDay } from '../domain/wear';
import { ACTIONS, IDS, cancel, schedule } from './notifications';
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
      actionTypeId: ACTIONS.replace,
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

/**
 * Wear reminders count the whole day: time already worn in earlier sessions
 * today is subtracted from the limit for the session that is running now.
 */
async function syncWear(settings, now) {
  await cancel(IDS.wearNear, IDS.wearMax, IDS.bedtime);
  const active = await db.sessions.filter((s) => s.endedAt == null).first();
  if (!active) return;

  const max = settings.maxWearHours;
  const dayStart = startOfDay(active.startedAt).getTime();
  const earlier = await db.sessions
    .where('startedAt')
    .between(dayStart - 24 * HOUR, active.startedAt)
    .filter((s) => s.id !== active.id && s.endedAt != null)
    .toArray();
  const wornEarlier = wornOnDay(earlier, dayStart, now);
  const limitAt = active.startedAt + max * HOUR - wornEarlier;

  await schedule({
    id: IDS.wearNear,
    at: limitAt - HOUR,
    title: '1 hour of wear left',
    body: `You've worn your lenses for ${max - 1} hours today.`,
    actionTypeId: ACTIONS.wear,
  });
  await schedule({
    id: IDS.wearMax,
    at: limitAt,
    title: 'Time to take your lenses out',
    body: `You've reached your ${max}-hour limit for today.`,
    actionTypeId: ACTIONS.wear,
  });

  if (settings.bedtimeReminder) {
    const [h, m] = settings.bedtimeReminder.split(':').map(Number);
    let at = atTime(now, { hour: h, minute: m });
    if (at.getTime() <= now) at = addDays(at, 1);
    await schedule({
      id: IDS.bedtime,
      at,
      title: 'Lenses still in',
      body: 'Take your lenses out before you go to sleep.',
      actionTypeId: ACTIONS.wear,
    });
  }
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
 * Rebuilds every scheduled reminder (and the home-screen widget) from what is
 * in the database. Safe to call any time; never throws (a failed reminder must
 * not break the app).
 */
export async function syncReminders() {
  if (!isNative) return;
  try {
    const settings = await db.settings.get('settings');
    if (!settings) return;
    const now = Date.now();
    await syncReplacement(settings, now);
    await syncWear(settings, now);
    await syncSupplies(now);
  } catch (err) {
    console.warn('Could not schedule reminders', err);
  }
  await syncWidget();
}
