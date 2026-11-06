import { useState } from 'react';
import { useNavigate } from 'react-router';
import { format, parse } from 'date-fns';
import { Bell, ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import Stepper from '../../components/ui/Stepper';
import { completeOnboarding } from '../../db/actions';
import { DEFAULT_SETTINGS, LENS_TYPES } from '../../db/db';
import { openedAtFromDate } from '../../domain/cycles';
import { isNative } from '../../platform/native';
import { ensurePermission } from '../../platform/notifications';
import { EyesLinkedField, LensTypeField, MaxHoursField } from '../settings/fields';

const today = () => format(new Date(), 'yyyy-MM-dd');

function Step({ title, intro, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold tracking-tight">{title}</h1>
        {intro && <p className="m-0 text-[15px] leading-relaxed text-fg-soft">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lens, setLens] = useState({
    lensType: DEFAULT_SETTINGS.lensType,
    replacementDays: DEFAULT_SETTINGS.replacementDays,
  });
  const [eyesLinked, setEyesLinked] = useState(true);
  const [maxWearHours, setMaxWearHours] = useState(DEFAULT_SETTINGS.maxWearHours);
  const [current, setCurrent] = useState('today'); // 'today' | 'earlier' | 'none'
  const [openedDate, setOpenedDate] = useState(today);
  const [stock, setStock] = useState({ left: 0, right: 0 });
  const [permission, setPermission] = useState(null); // null | true | false

  const daily = lens.lensType === 'daily';
  const steps = [
    'welcome',
    'lens',
    !daily && 'eyes',
    'hours',
    !daily && 'current',
    'stock',
    isNative && 'reminders',
    'done',
  ].filter(Boolean);
  const step = steps[Math.min(index, steps.length - 1)];
  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  async function finish(path) {
    setSaving(true);
    const openedAt =
      daily || current === 'none' ? null : current === 'today' ? Date.now() : openedAtFromDate(openedDate);
    navigate(path, { replace: true });
    await completeOnboarding({
      settings: { ...lens, eyesLinked: daily ? true : eyesLinked, maxWearHours },
      openedAt,
      stock,
    });
  }

  if (step === 'welcome') {
    return (
      <main className="mx-auto flex h-full max-w-md flex-col justify-center gap-6 px-6">
        <img src="/favicon.svg" alt="" width="64" height="64" />
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-3xl font-bold tracking-tight">Lens Log</h1>
          <p className="m-0 text-base leading-relaxed text-fg-soft">
            Track when to replace your lenses, how long you wear them, and how to care for them.
          </p>
        </div>
        <Button onClick={next}>Get started</Button>
        <p className="m-0 text-xs leading-relaxed text-muted">
          Everything stays on this device. Takes about a minute to set up.
        </p>
      </main>
    );
  }

  const progress = steps.indexOf(step); // welcome is 0, so this is 1-based for the rest
  const total = steps.length - 1;

  let body;
  let primary = { label: 'Continue', onClick: next };

  switch (step) {
    case 'lens':
      body = (
        <Step title="What lenses do you wear?" intro="This sets how long each lens lasts before you replace it.">
          <LensTypeField lensType={lens.lensType} replacementDays={lens.replacementDays} onChange={setLens} />
          {daily && (
            <p className="m-0 text-sm leading-relaxed text-muted">
              Daily lenses are thrown away after each day, so there is no replacement countdown. Lens Log tracks your wear
              time and stock.
            </p>
          )}
        </Step>
      );
      break;
    case 'eyes':
      body = (
        <Step title="Your two eyes" intro="Your left and right lenses have different prescriptions, so Lens Log tracks them separately.">
          <EyesLinkedField value={eyesLinked} onChange={setEyesLinked} />
        </Step>
      );
      break;
    case 'hours':
      body = (
        <Step title="How long do you wear them?" intro="Lens Log times each day you wear your lenses.">
          <MaxHoursField value={maxWearHours} onChange={setMaxWearHours} />
        </Step>
      );
      break;
    case 'current':
      body = (
        <Step
          title="Your current lenses"
          intro={`When did you open the pack you're using now? Day 1 is the day it was opened.`}
        >
          <Segmented
            name="current"
            legend="Pack opened"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'earlier', label: 'Earlier' },
              { value: 'none', label: 'Not yet' },
            ]}
            value={current}
            onChange={setCurrent}
          />
          {current === 'earlier' && (
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Opened on
              <input
                type="date"
                required
                value={openedDate}
                max={today()}
                onChange={(e) => setOpenedDate(e.target.value || today())}
                className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg"
              />
            </label>
          )}
          {current === 'none' && (
            <p className="m-0 text-sm leading-relaxed text-muted">
              No problem. Tap "I opened a new pack" on the Home screen when you start a new pair.
            </p>
          )}
        </Step>
      );
      break;
    case 'stock':
      body = (
        <Step title="Spare lenses" intro="How many unopened lenses do you have for each eye? You'll get a warning when you're running low.">
          <Stepper
            id="stockLeft"
            label="Left eye"
            value={stock.left}
            min={0}
            max={180}
            unit="lenses"
            onChange={(n) => setStock((s) => ({ ...s, left: n }))}
          />
          <Stepper
            id="stockRight"
            label="Right eye"
            value={stock.right}
            min={0}
            max={180}
            unit="lenses"
            onChange={(n) => setStock((s) => ({ ...s, right: n }))}
          />
        </Step>
      );
      break;
    case 'reminders':
      primary =
        permission === null
          ? {
              label: 'Turn on reminders',
              onClick: async () => {
                const granted = await ensurePermission().catch(() => false);
                setPermission(granted);
              },
            }
          : { label: 'Continue', onClick: next };
      body = (
        <Step title="Reminders" intro="Lens Log can remind you even when the app is closed:">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {[
              daily ? null : 'The evening before and the morning your new lenses are due',
              `An hour before and when you reach ${maxWearHours} hours of wear`,
            ]
              .filter(Boolean)
              .map((text) => (
                <li key={text} className="flex gap-3 text-[15px] leading-relaxed text-fg-soft">
                  <Bell aria-hidden="true" size={20} className="mt-0.5 flex-none text-accent" />
                  {text}
                </li>
              ))}
          </ul>
          {permission === true && <p className="m-0 text-sm font-semibold text-ok">Reminders are on.</p>}
          {permission === false && (
            <p className="m-0 text-sm leading-relaxed text-muted">
              Reminders are off. You can turn them on later in Android settings → Apps → Lens Log → Notifications.
            </p>
          )}
        </Step>
      );
      break;
    case 'done':
      body = (
        <Step title="You're all set" intro="Here's what Lens Log will track:">
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-[20px] border border-line bg-surface p-5 text-[15px]">
            <dt className="text-muted">Lenses</dt>
            <dd className="m-0 font-semibold">
              {LENS_TYPES[lens.lensType].label}
              {lens.lensType === 'custom' && ` (${lens.replacementDays} days)`}
            </dd>
            <dt className="text-muted">Wear limit</dt>
            <dd className="m-0 font-semibold">{maxWearHours} hours a day</dd>
            {!daily && (
              <>
                <dt className="text-muted">Current pack</dt>
                <dd className="m-0 font-semibold">
                  {current === 'none'
                    ? 'Not started'
                    : current === 'today'
                      ? 'Opened today'
                      : `Opened ${format(parse(openedDate, 'yyyy-MM-dd', new Date()), 'MMM d')}`}
                </dd>
              </>
            )}
            <dt className="text-muted">Spares</dt>
            <dd className="m-0 font-semibold">
              Left {stock.left} · Right {stock.right}
            </dd>
          </dl>
          <p className="m-0 text-sm leading-relaxed text-muted">You can change any of this later in Settings.</p>
        </Step>
      );
      primary = { label: 'Go to Lens Log', onClick: () => finish('/') };
      break;
  }

  return (
    <main className="mx-auto flex h-full max-w-md flex-col px-5 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),20px)]">
      <div className="flex items-center gap-2 py-2">
        <button
          type="button"
          aria-label="Back"
          onClick={back}
          className="-ml-3 flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-fg"
        >
          <ChevronLeft aria-hidden="true" size={22} />
        </button>
        <div
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={progress}
          className="grid flex-1 gap-1.5"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 rounded-full ${i < progress ? 'bg-accent' : 'bg-track'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">{body}</div>

      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={primary.onClick} disabled={saving}>
          {primary.label}
        </Button>
        {step === 'reminders' && permission === null && (
          <Button variant="ghost" onClick={next}>
            Not now
          </Button>
        )}
        {step === 'done' && (
          <Button variant="ghost" onClick={() => finish('/guide/putting-in')} disabled={saving}>
            First time? Show me how to put lenses in
          </Button>
        )}
      </div>
    </main>
  );
}
