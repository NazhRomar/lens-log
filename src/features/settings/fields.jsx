import Segmented from '../../components/ui/Segmented';
import Stepper from '../../components/ui/Stepper';
import { LENS_TYPES } from '../../db/db';

// Setting fields shared by onboarding and the Settings screen.

const TYPE_OPTIONS = Object.entries(LENS_TYPES).map(([value, t]) => ({ value, label: t.label }));

/** onChange({ lensType, replacementDays }) */
export function LensTypeField({ lensType, replacementDays, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <Segmented
        name="lensType"
        legend="Lens type"
        options={TYPE_OPTIONS}
        value={lensType}
        onChange={(type) =>
          onChange({
            lensType: type,
            replacementDays: LENS_TYPES[type].days ?? (replacementDays > 1 ? replacementDays : 7),
          })
        }
      />
      {lensType === 'custom' && (
        <Stepper
          id="replacementDays"
          label="Replace every"
          value={replacementDays}
          min={2}
          max={90}
          unit="days"
          onChange={(days) => onChange({ lensType, replacementDays: days })}
        />
      )}
    </div>
  );
}

export function EyesLinkedField({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <Segmented
        name="eyesLinked"
        legend="Replace both eyes"
        options={[
          { value: 'together', label: 'Together' },
          { value: 'separate', label: 'Separately' },
        ]}
        value={value ? 'together' : 'separate'}
        onChange={(v) => onChange(v === 'together')}
      />
      <p className="m-0 text-sm leading-relaxed text-muted">
        Together shows one countdown while both lenses are on the same schedule. If one tears and you replace it early,
        each eye gets its own countdown until they line up again.
      </p>
    </div>
  );
}

/** Bedtime reminder: null (off) or "HH:mm". */
export function BedtimeField({ value, onChange }) {
  const on = !!value;
  return (
    <div className="flex flex-col gap-2">
      <Segmented
        name="bedtime"
        legend="Bedtime reminder"
        options={[
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' },
        ]}
        value={on ? 'on' : 'off'}
        onChange={(v) => onChange(v === 'on' ? '22:30' : null)}
      />
      {on && (
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">
          Remind me at
          <input
            type="time"
            required
            value={value}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg"
          />
        </label>
      )}
      <p className="m-0 text-sm leading-relaxed text-muted">
        Only sent if your lenses are still logged in at that time.
      </p>
    </div>
  );
}

export function MaxHoursField({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <Stepper id="maxWearHours" label="Daily wear limit" value={value} min={4} max={18} unit="hours" onChange={onChange} />
      <p className="m-0 text-sm leading-relaxed text-muted">
        Use the limit your eye care professional recommends. You get a reminder an hour before and when you reach it.
      </p>
    </div>
  );
}
