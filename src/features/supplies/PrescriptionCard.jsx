import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { savePrescriptions } from '../../db/actions';
import { formatNumber, formatPower } from '../../domain/supplies';

// Number keypads on many Android keyboards have no minus key, so signed values
// (power, cylinder) get a separate −/+ button and the input takes digits only.
// A comma is accepted as the decimal point.
const DECIMAL = '[0-9]{1,2}([.,][0-9]{1,2})?';
const FIELDS = [
  { key: 'power', label: 'Power (PWR)', signed: true, required: true, pattern: DECIMAL, placeholder: '2.25' },
  { key: 'baseCurve', label: 'Base curve (BC)', pattern: DECIMAL, placeholder: '8.6' },
  { key: 'diameter', label: 'Diameter (DIA)', pattern: DECIMAL, placeholder: '14.2' },
  { key: 'cylinder', label: 'Cylinder (CYL)', signed: true, pattern: DECIMAL, placeholder: '0.75' },
  { key: 'axis', label: 'Axis', pattern: '[0-9]{1,3}', placeholder: '180', numeric: true },
];

/** Form values are strings; signed ones carry their sign: "-2.25", "+1.00", or "-" when empty. */
function toForm(p) {
  return Object.fromEntries(
    FIELDS.map((f) => {
      const v = p?.[f.key];
      if (!f.signed) return [f.key, v == null ? '' : String(v)];
      // Most lens powers are negative, so a new entry starts at minus.
      if (v == null) return [f.key, '-'];
      return [f.key, `${v < 0 ? '-' : '+'}${Math.abs(v)}`];
    }),
  );
}

function fromForm(form) {
  return Object.fromEntries(
    FIELDS.map((f) => {
      const raw = String(form[f.key] ?? '').replace(',', '.');
      const digits = raw.replace(/^[-+]/, '');
      if (digits === '') return [f.key, null];
      const n = Number(f.signed ? `${raw.startsWith('-') ? '-' : ''}${digits}` : digits);
      return [f.key, Number.isFinite(n) ? n : null];
    }),
  );
}

const INPUT =
  'min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg tabular-nums invalid:border-danger';

function SignedInput({ name, field, value, onChange }) {
  const negative = value.startsWith('-');
  const digits = value.replace(/^[-+]/, '');
  const sign = negative ? '-' : '+';
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-label={negative ? 'Minus. Switch to plus' : 'Plus. Switch to minus'}
        onClick={() => onChange(`${negative ? '+' : '-'}${digits}`)}
        className="flex min-h-11 w-12 flex-none cursor-pointer items-center justify-center rounded-xl border border-line bg-bg text-xl font-bold text-fg"
      >
        {negative ? '−' : '+'}
      </button>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        name={name}
        required={field.required}
        pattern={field.pattern}
        placeholder={field.placeholder}
        value={digits}
        onChange={(e) => {
          const t = e.target.value;
          // A keyboard that does have a minus key still works.
          if (t.startsWith('-') || t.startsWith('+')) onChange(`${t[0]}${t.slice(1).replace(/[^0-9.,]/g, '')}`);
          else onChange(`${sign}${t.replace(/[^0-9.,]/g, '')}`);
        }}
        className={INPUT}
      />
    </div>
  );
}

function EyeFields({ eye, label, values, onChange }) {
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-bold">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => {
          const name = `${eye}-${f.key}`;
          const set = (v) => onChange({ ...values, [f.key]: v });
          return (
            <label
              key={f.key}
              className={`flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold text-fg-soft ${f.signed ? 'col-span-2' : ''}`}
            >
              {f.label}
              {f.signed ? (
                <SignedInput name={name} field={f} value={values[f.key]} onChange={set} />
              ) : (
                <input
                  type="text"
                  inputMode={f.numeric ? 'numeric' : 'decimal'}
                  autoComplete="off"
                  name={name}
                  pattern={f.pattern}
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  onChange={(e) => set(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className={INPUT}
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function PrescriptionCard({ prescriptions, brand, lensLabel }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const { left, right } = prescriptions;
  const hasAny = !!(left || right);

  function startEdit() {
    setForm({ left: toForm(left), right: toForm(right), brand: brand ?? '' });
    setEditing(true);
  }

  async function save(e) {
    e.preventDefault();
    await savePrescriptions({ left: fromForm(form.left), right: fromForm(form.right), brand: form.brand });
    setEditing(false);
  }

  const header = (
    <div className="flex items-center justify-between">
      <h2 id="rx-h" className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
        Prescription
      </h2>
      {hasAny && !editing && (
        <button
          type="button"
          onClick={startEdit}
          className="min-h-11 cursor-pointer border-0 bg-transparent px-1 text-sm font-semibold text-accent"
        >
          Edit
        </button>
      )}
    </div>
  );

  if (editing) {
    return (
      <section aria-labelledby="rx-h" className="flex flex-col gap-2">
        {header}
        <Card as="form" onSubmit={save} className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-fg-soft">
            Brand
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg"
            />
          </label>
          <EyeFields eye="left" label="Left eye" values={form.left} onChange={(v) => setForm({ ...form, left: v })} />
          <EyeFields eye="right" label="Right eye" values={form.right} onChange={(v) => setForm({ ...form, right: v })} />
          <p className="m-0 text-xs leading-relaxed text-muted">
            Copy these from your contact lens prescription or the lens box. CYL and axis are only for toric lenses.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="text-fg" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </Card>
      </section>
    );
  }

  if (!hasAny) {
    return (
      <section aria-labelledby="rx-h" className="flex flex-col gap-2">
        {header}
        <Card className="flex flex-col gap-3 p-4">
          <p className="m-0 text-sm leading-relaxed text-muted">
            Save your prescription for each eye so it's handy when you reorder.
          </p>
          <Button variant="secondary" onClick={startEdit}>
            Add prescription
          </Button>
        </Card>
      </section>
    );
  }

  const toric = [left, right].some((p) => p?.cylinder != null || p?.axis != null);
  const cols = ['PWR', 'BC', 'DIA', ...(toric ? ['CYL', 'AXIS'] : [])];
  const row = (p) => [
    formatPower(p?.power),
    formatNumber(p?.baseCurve),
    formatNumber(p?.diameter),
    ...(toric ? [formatPower(p?.cylinder), p?.axis != null ? `${p.axis}°` : '—'] : []),
  ];

  return (
    <section aria-labelledby="rx-h" className="flex flex-col gap-2">
      {header}
      <Card className="flex flex-col gap-3 p-4">
        <span className="text-[15px] font-semibold">
          {brand || 'Brand not set'} · {lensLabel}
        </span>
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className="py-1.5 font-semibold">
                Eye
              </th>
              {cols.map((c) => (
                <th key={c} scope="col" className="py-1.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Left', left],
              ['Right', right],
            ].map(([label, p]) => (
              <tr key={label} className="border-t border-line">
                <th scope="row" className="py-2.5 text-left font-semibold">
                  {label}
                </th>
                {row(p).map((v, i) => (
                  <td key={i} className="py-2.5">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
