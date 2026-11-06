import { db } from './db';

const FORMAT = 'lenslog-backup';
const VERSION = 1;

/** Returns every table as a plain object, ready for JSON.stringify. */
export async function exportData() {
  const tables = {};
  for (const table of db.tables) {
    tables[table.name] = await table.toArray();
  }
  return { format: FORMAT, version: VERSION, exportedAt: Date.now(), tables };
}

/** Downloads a backup file of all data. */
export async function downloadBackup() {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lenslog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Replaces all data with the contents of a backup. Throws if the file is not a Lens Log backup. */
export async function importData(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (data?.format !== FORMAT || typeof data.tables !== 'object') {
    throw new Error('This file is not a Lens Log backup.');
  }
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
      const rows = data.tables[table.name];
      if (Array.isArray(rows) && rows.length) await table.bulkPut(rows);
    }
  });
}
