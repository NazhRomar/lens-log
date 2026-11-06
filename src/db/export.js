import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative } from '../platform/native';
import { syncReminders } from '../platform/reminders';
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

/**
 * Saves a backup file of all data. In the browser it downloads the file; in the
 * Android app (where downloads don't work) it opens the share sheet so the file
 * can be saved to Files, Drive, email, etc.
 */
export async function downloadBackup() {
  const json = JSON.stringify(await exportData(), null, 2);
  const filename = `lenslog-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (isNative) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: 'Lens Log backup', files: [uri] });
    return;
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
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
  await syncReminders();
}
