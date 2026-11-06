import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { savePrescriptions } from '../../db/actions';
import { formatNumber, formatPower } from '../../domain/supplies';

const FIELDS = [
  { key: 'power', label: 'Power (PWR)', step: 0.25, min: -30, max: 30, required: true },
  { key: 'baseCurve', label: 'Base curve (BC)', step: 0.1, min: 7, max: 10 },
  { key: 'diameter', label: 'Diameter (DIA)', step: 0.1, min: 12, max: 16 },
  { key: 'cylinder', label: 'Cylinder (CYL)', step: 0.25, min: -10, max: 10 },
  { key: 'axis', label: 'Axis', step: 1, min: 0, max: 180 },
];

const toForm = (p) => Object.fromEntries(FIELDS.map((f) => [f.key, p?.[f.key] ?? '']));
const fromForm = (f) =>
  Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' || v == null ? null : Number(v)]));

function EyeFields({ eye, label, values, onChange }) {
  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-bold">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className={`flex flex-col gap-1.5 text-[13px] font-semibold text-fg-soft ${f.key === 'power' ? 'col-span-2' : ''}`}>
            {f.label}
            <input
              type="number"
              name={`${eye}-${f.key}`}
              required={f.required}
              step={f.step}
              min={f.min}
              max={f.max}
              value={values[f.key]}
              onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg tabular-nums"
            />
          </label>
        ))}
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
