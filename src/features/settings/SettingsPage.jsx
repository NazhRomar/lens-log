import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { resetAllData, updateLensSchedule } from '../../db/actions';
import { syncReminders } from '../../platform/reminders';
import { downloadBackup, importData } from '../../db/export';
import { BedtimeField, EyesLinkedField, LensTypeField, MaxHoursField } from './fields';
import { updateSettings, useSettings } from '../../hooks/useSettings';
import { isNative } from '../../platform/native';
import {
  IDS,
  ensurePermission,
  exactAlarmStatus,
  openExactAlarmSettings,
  schedule,
} from '../../platform/notifications';

function NotificationsCard({ settings }) {
  const [status, setStatus] = useState('');

  if (!isNative) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="m-0 text-[15px] font-semibold">Notifications</h2>
        <p className="m-0 text-sm leading-relaxed text-muted">Reminders work in the Android app.</p>
      </Card>
    );
  }

  async function sendTest() {
    if (!(await ensurePermission())) {
      setStatus('Notifications are turned off for Lens Log in Android settings.');
      return;
    }
    await schedule({
      id: IDS.test,
      at: Date.now() + 10_000,
      title: 'Lens Log test',
      body: 'Notifications are working.',
    });
    const exact = await exactAlarmStatus();
    setStatus(
      exact === 'granted'
        ? 'Test notification in 10 seconds. You can close the app.'
        : 'Test scheduled. Allow "Alarms & reminders" so reminders arrive on time.',
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="m-0 text-[15px] font-semibold">Notifications</h2>
      <p className="m-0 text-sm leading-relaxed text-muted">
        Replacement, wear-time and bedtime reminders are scheduled on this phone and arrive even when the app is closed.
      </p>
      <BedtimeField
        value={settings.bedtimeReminder}
        onChange={async (v) => {
          await updateSettings({ bedtimeReminder: v });
          await syncReminders();
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={sendTest}>
          Send test
        </Button>
        <Button variant="secondary" onClick={openExactAlarmSettings}>
          Exact alarms
        </Button>
      </div>
      {status && (
        <p role="status" className="m-0 text-sm text-fg-soft">
          {status}
        </p>
      )}
    </Card>
  );
}

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsPage() {
  const settings = useSettings();
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  if (!settings) return null;

  async function onImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Replace all data on this device with this backup?')) return;
    try {
      await importData(await file.text());
      setMessage('Backup restored.');
    } catch (err) {
      setMessage(err.message || 'Could not read that file.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="-ml-3 flex items-center gap-2">
        <Link to="/" aria-label="Back to Home" className="flex size-11 items-center justify-center rounded-xl text-fg">
          <ChevronLeft aria-hidden="true" size={22} />
        </Link>
        <h1 className="m-0 text-lg font-bold">Settings</h1>
      </header>

      <Card aria-labelledby="lenses-h" className="flex flex-col gap-5">
        <h2 id="lenses-h" className="m-0 text-[15px] font-semibold">
          Lenses
        </h2>
        <LensTypeField
          lensType={settings.lensType}
          replacementDays={settings.replacementDays}
          onChange={updateLensSchedule}
        />
        {settings.lensType !== 'daily' && (
          <EyesLinkedField value={settings.eyesLinked} onChange={(v) => updateSettings({ eyesLinked: v })} />
        )}
        <MaxHoursField value={settings.maxWearHours} onChange={(v) => updateSettings({ maxWearHours: v })} />
      </Card>

      <Card as="fieldset" className="m-0 flex flex-col gap-3">
        <legend className="sr-only">Theme</legend>
        <span aria-hidden="true" className="text-[15px] font-semibold">
          Theme
        </span>
        <div className="grid grid-cols-3 gap-2 rounded-[14px] bg-bg p-1">
          {THEMES.map((t) => (
            <label
              key={t.value}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                settings.theme === t.value ? 'bg-surface text-fg shadow-sm' : 'text-muted'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={t.value}
                checked={settings.theme === t.value}
                onChange={() => updateSettings({ theme: t.value })}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </Card>

      <NotificationsCard settings={settings} />

      <Card className="flex flex-col gap-3">
        <h2 className="m-0 text-[15px] font-semibold">Backup</h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Your data is stored only on this device. Save a backup file to keep it safe or move it to a new phone.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={downloadBackup}>
            Export
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
        {message && (
          <p role="status" className="m-0 text-sm text-fg-soft">
            {message}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="m-0 text-[15px] font-semibold">Reset</h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Deletes all lenses, wear history, supplies and settings on this device and starts setup again. Export a backup
          first if you want to keep anything.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Delete all Lens Log data on this device? This cannot be undone.')) resetAllData();
          }}
          className="min-h-12 cursor-pointer rounded-[14px] border border-danger/40 bg-danger-soft text-base font-semibold text-danger"
        >
          Reset all data
        </button>
      </Card>
    </div>
  );
}
