import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './native';

// Local notifications scheduled on the phone itself: no server, work offline,
// fire while the app is closed. Only available in the Android app; in a
// browser every function here is a safe no-op.
//
// Each reminder kind owns a fixed id so it can be replaced or cancelled
// without touching the others.
export const IDS = {
  replaceLeft: 1001,
  replaceRight: 1002,
  replaceLeftSoon: 1011,
  replaceRightSoon: 1012,
  wearNear: 2001,
  wearMax: 2002,
  bedtime: 3001,
  caseReplace: 4001,
  solutionDiscard: 4002,
  test: 9001,
};

/** Buttons shown on notifications. */
export const ACTIONS = { wear: 'WEAR', replace: 'REPLACE' };
export const ACTION_IDS = { takeOut: 'take-out', replace: 'replace' };

const CHANNEL_ID = 'reminders';

/** Asks for notification permission (Android 13+). Returns true if granted. */
export async function ensurePermission() {
  if (!isNative) return false;
  let { display } = await LocalNotifications.checkPermissions();
  if (display === 'prompt' || display === 'prompt-with-rationale') {
    ({ display } = await LocalNotifications.requestPermissions());
  }
  return display === 'granted';
}

/**
 * Android 12+ may delay alarms unless "Alarms & reminders" is allowed for the app.
 * Returns 'granted' | 'denied'.
 */
export async function exactAlarmStatus() {
  if (!isNative) return 'denied';
  const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
  return exact_alarm;
}

/** Opens the system screen where the user can allow exact alarms. */
export function openExactAlarmSettings() {
  if (!isNative) return Promise.resolve();
  return LocalNotifications.changeExactNotificationSetting();
}

let ready = false;
async function ensureSetup() {
  if (ready) return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Reminders',
    description: 'Lens replacement, wear time and bedtime reminders',
    importance: 4, // high: shows as a heads-up notification
    visibility: 1,
  });
  await LocalNotifications.registerActionTypes({
    types: [
      { id: ACTIONS.wear, actions: [{ id: ACTION_IDS.takeOut, title: 'Take lenses out' }] },
      { id: ACTIONS.replace, actions: [{ id: ACTION_IDS.replace, title: 'Start new lenses' }] },
    ],
  });
  ready = true;
}

/**
 * Schedules (or replaces) one notification at a fixed time. Times in the past are ignored.
 * @param {{id:number, at:Date|number, title:string, body:string, actionTypeId?:string}} n
 */
export async function schedule({ id, at, title, body, actionTypeId }) {
  if (!isNative) return;
  const when = new Date(at);
  if (when.getTime() <= Date.now()) return;
  await ensureSetup();
  await cancel(id);
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_lens',
        actionTypeId,
        schedule: { at: when, allowWhileIdle: true },
      },
    ],
  });
}

export async function cancel(...ids) {
  if (!isNative || ids.length === 0) return;
  await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
}

/** Cancels every scheduled reminder (used by "Reset all data"). */
export async function cancelAll() {
  if (!isNative) return;
  const { notifications } = await LocalNotifications.getPending();
  if (notifications.length) await LocalNotifications.cancel({ notifications });
}

/**
 * Calls `handler(actionId, notification)` when a notification or one of its
 * buttons is tapped. actionId is 'tap' for the notification itself.
 * Returns a function that removes the listener.
 */
export function onNotificationAction(handler) {
  if (!isNative) return () => {};
  const sub = LocalNotifications.addListener('localNotificationActionPerformed', ({ actionId, notification }) =>
    handler(actionId, notification),
  );
  return () => sub.then((s) => s.remove());
}
