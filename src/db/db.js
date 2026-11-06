import Dexie from 'dexie';

// All data lives on this device in IndexedDB. See PLAN.md for record shapes.
export const db = new Dexie('lenslog');

db.version(1).stores({
  settings: 'id',
  cycles: '++id, eye, openedAt, closedAt',
  sessions: '++id, startedAt, endedAt',
  supplies: 'id',
  stock: 'eye',
  prescriptions: 'eye',
  symptoms: '++id, at',
});

export const DEFAULT_SETTINGS = {
  id: 'settings',
  lensType: 'biweekly',
  replacementDays: 14,
  brand: '',
  eyesLinked: true,
  maxWearHours: 10,
  countMode: 'calendar',
  bedtimeReminder: null,
  theme: 'system',
  onboarded: false,
};

export const LENS_TYPES = {
  daily: { label: 'Daily', days: 1 },
  biweekly: { label: '2-week', days: 14 },
  monthly: { label: 'Monthly', days: 30 },
  custom: { label: 'Custom', days: null },
};

db.on('populate', (tx) => {
  tx.table('settings').add(DEFAULT_SETTINGS);
  tx.table('stock').bulkAdd([
    { eye: 'left', count: 0, lowThreshold: 2 },
    { eye: 'right', count: 0, lowThreshold: 2 },
  ]);
});
