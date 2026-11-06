import { registerPlugin } from '@capacitor/core';
import { addDays, startOfDay } from 'date-fns';
import { db } from '../db/db';
import { cycleStatus, sameSchedule } from '../domain/cycles';
import { isLowStock } from '../domain/supplies';
import { wornOnDay } from '../domain/wear';
import { isNative } from './native';

// Native side: android/app/src/main/java/com/nazhromar/lenslog/
//   WidgetBridgePlugin.java (receives this), WidgetData.java (reads it),
//   LensLogWidget / WearWidget / RingWidget / SuppliesWidget / OverviewWidget.
const WidgetBridge = registerPlugin('WidgetBridge');

const EYE_LABEL = { left: 'Left eye', right: 'Right eye' };
const NONE = -1;

function supplyDue(supply) {
  return supply ? startOfDay(addDays(supply.openedAt, supply.discardAfterDays)).getTime() : NONE;
}

/**
 * Sends the home-screen widgets what they need. They get dates and numbers,
 * not finished text, so they can recount days after midnight and run a live
 * wear clock without the app open.
 */
export async function syncWidget() {
  if (!isNative) return;
  try {
    const now = Date.now();
    const today = startOfDay(now).getTime();
    const settings = await db.settings.get('settings');
    const open = await db.cycles.filter((c) => c.closedAt == null).toArray();
    const active = await db.sessions.filter((s) => s.endedAt == null).first();
    const ended = await db.sessions
      .where('startedAt')
      .above(today - 24 * 60 * 60 * 1000)
      .filter((s) => s.endedAt != null)
      .toArray();
    const supplies = Object.fromEntries((await db.supplies.toArray()).map((s) => [s.id, s]));
    const stock = Object.fromEntries((await db.stock.toArray()).map((s) => [s.eye, s]));
    const left = open.find((c) => c.eye === 'left');
    const right = open.find((c) => c.eye === 'right');

    // Countdown: both eyes together, or whichever eye is due first.
    let shown = null;
    let eyeLabel = '';
    if (sameSchedule(left, right)) {
      shown = left;
      eyeLabel = 'Both eyes';
    } else {
      shown = [left, right].filter(Boolean).sort(
        (a, b) => cycleStatus(a, now).replaceBy - cycleStatus(b, now).replaceBy,
      )[0];
      if (shown) eyeLabel = EYE_LABEL[shown.eye];
    }

    const days = settings?.replacementDays ?? 14;
    const stockLeft = stock.left?.count ?? 0;
    const stockRight = stock.right?.count ?? 0;

    await WidgetBridge.update({
      replaceBy: shown ? startOfDay(cycleStatus(shown, now).replaceBy).getTime() : NONE,
      totalDays: shown ? shown.replacementDays : days,
      eyeLabel,
      daily: settings?.lensType === 'daily',
      wearingSince: active ? active.startedAt : NONE,
      wornEarlierMs: wornOnDay(ended, today, now),
      wornDay: today,
      maxHours: settings?.maxWearHours ?? 10,
      caseDue: supplyDue(supplies.case),
      solutionDue: supplyDue(supplies.solution),
      stockLeft,
      stockRight,
      lowLeft: isLowStock({ count: stockLeft }, days),
      lowRight: isLowStock({ count: stockRight }, days),
    });
  } catch (err) {
    console.warn('Could not update widgets', err);
  }
}

/** Empties the widgets (after "Reset all data"). */
export async function clearWidget() {
  if (!isNative) return;
  await WidgetBridge.clear().catch(() => {});
}
