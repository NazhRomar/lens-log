import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';
import { db } from '../db/db';
import { isNative } from '../platform/native';

/** Settings row, or undefined while loading. */
export function useSettings() {
  return useLiveQuery(() => db.settings.get('settings'));
}

export function updateSettings(changes) {
  return db.settings.update('settings', changes);
}

const BAR_STYLE = {
  light: SystemBarsStyle.Light, // dark icons on the light background
  dark: SystemBarsStyle.Dark, // light icons on the dark background
  system: SystemBarsStyle.Default,
};

/**
 * Applies the theme setting to <html data-theme> ('system' follows the device),
 * and in the Android app matches the status-bar icon color to it.
 */
export function useApplyTheme(theme) {
  useEffect(() => {
    const root = document.documentElement;
    if (!theme || theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    if (isNative) SystemBars.setStyle({ style: BAR_STYLE[theme ?? 'system'] }).catch(() => {});
  }, [theme]);
}
