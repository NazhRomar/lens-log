import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { App as CapApp } from '@capacitor/app';
import { putIn, takeOut } from '../db/actions';
import { db } from '../db/db';
import { runBackHandlers } from './back';
import { isNative } from './native';
import { ACTIONS, ACTION_IDS, onNotificationAction } from './notifications';
import { syncReminders } from './reminders';

const SCHEME = 'com.nazhromar.lenslog://';
const HANDLED_KEY = 'lenslog.handledLaunchUrl';

/** Widget "Put in / Take out": log it, then go back to the home screen. */
async function toggleWear() {
  const settings = await db.settings.get('settings');
  if (!settings?.onboarded) return false;
  const active = await db.sessions.filter((s) => s.endedAt == null).first();
  if (active) await takeOut();
  else await putIn();
  return true;
}

/**
 * Android-only glue that needs the router: the hardware back button,
 * notification taps and buttons, widget taps (deep links), and refreshing
 * reminders and widgets when the app comes back to the foreground.
 * Renders nothing.
 */
export default function NativeBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isNative) return undefined;

    async function openLink(url) {
      if (!url?.startsWith(SCHEME)) return;
      const path = url.slice(SCHEME.length);
      if (path === 'wear/toggle') {
        if (await toggleWear()) {
          navigate('/');
          CapApp.minimizeApp();
        }
      } else if (path === 'open/supplies') {
        navigate('/supplies');
      } else {
        navigate('/');
      }
    }

    // Cold start from a widget: handle the launch link once (not again after a reload).
    CapApp.getLaunchUrl().then((launch) => {
      const url = launch?.url;
      if (!url) return;
      try {
        if (sessionStorage.getItem(HANDLED_KEY) === url) return;
        sessionStorage.setItem(HANDLED_KEY, url);
      } catch {
        // storage unavailable: handle it anyway
      }
      openLink(url);
    });
    const urlOpen = CapApp.addListener('appUrlOpen', ({ url }) => openLink(url));

    const back = CapApp.addListener('backButton', () => {
      const dialog = document.querySelector('dialog[open]');
      if (dialog) return dialog.close(); // fires the dialog's onClose
      if (runBackHandlers()) return undefined;
      if (pathRef.current !== '/') {
        if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
        else navigate('/', { replace: true });
        return undefined;
      }
      return CapApp.minimizeApp();
    });

    const resume = CapApp.addListener('resume', () => syncReminders());

    const offAction = onNotificationAction(async (actionId, notification) => {
      if (actionId === ACTION_IDS.takeOut) {
        await takeOut();
        navigate('/');
      } else if (actionId === ACTION_IDS.replace || notification?.actionTypeId === ACTIONS.replace) {
        navigate('/?replace=1');
      } else {
        navigate('/');
      }
    });

    return () => {
      urlOpen.then((s) => s.remove());
      back.then((s) => s.remove());
      resume.then((s) => s.remove());
      offAction();
    };
  }, [navigate]);

  return null;
}
