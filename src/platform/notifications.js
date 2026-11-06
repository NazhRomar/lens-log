import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './native';

// Local notifications scheduled on the phone itself: no server, work offline,
// fire while the app is closed. Only available in the Android app; in a
// browser every function here is a safe no-op.
//
// Each reminder kind owns a fixed id range so it can be replaced or cancelled
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

const CHANNEL_ID = 'reminders';

export async function notificationsAvailable() {
  return isNative;
}

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

let channelReady = false;
async function ensureChannel() {
  if (channelReady) return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Reminders',
    description: 'Lens replacement, wear time and bedtime reminders',
    importance: 4, // high: shows as a heads-up notification
    visibility: 1,
  });
  channelReady = true;
}

/**
 * Schedules (or replaces) one notification at a fixed time. Times in the past are ignored.
 * @param {{id:number, at:Date|number, title:string, body:string, every?:'day'}} n
 */
export async function schedule({ id, at, title, body, every }) {
  if (!isNative) return;
  const when = new Date(at);
  if (!every && when.getTime() <= Date.now()) return;
  await ensureChannel();
  await cancel(id);
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_lens',
        schedule: every
          ? { on: { hour: when.getHours(), minute: when.getMinutes() }, allowWhileIdle: true }
          : { at: when, allowWhileIdle: true },
      },
    ],
  });
}

export async function cancel(...ids) {
  if (!isNative || ids.length === 0) return;
  await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
}

/** Lists scheduled notifications (useful for a debug screen). */
export async function pending() {
  if (!isNative) return [];
  const { notifications } = await LocalNotifications.getPending();
  return notifications;
}
