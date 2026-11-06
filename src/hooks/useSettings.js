import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

/** Settings row, or undefined while loading. */
export function useSettings() {
  return useLiveQuery(() => db.settings.get('settings'));
}

export function updateSettings(changes) {
  return db.settings.update('settings', changes);
}

/** Applies the theme setting to <html data-theme>. 'system' follows the device. */
export function useApplyTheme(theme) {
  useEffect(() => {
    const root = document.documentElement;
    if (!theme || theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
}
