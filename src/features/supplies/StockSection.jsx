import { Minus, Plus } from 'lucide-react';
import { setStock } from '../../db/actions';
import { formatPower, isLowStock, stockDuration } from '../../domain/supplies';

const BTN =
  'flex size-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-bg text-fg disabled:cursor-not-allowed disabled:opacity-40';

function EyeStock({ eye, label, row, prescription, replacementDays }) {
  const count = row?.count ?? 0;
  const low = row && isLowStock(row);
  const note = count === 0 ? 'Out of stock' : low ? 'Low · reorder soon' : stockDuration(count, replacementDays);

  return (
    <div
      role="group"
      aria-labelledby={`stock-${eye}`}
      className={`flex flex-col gap-2 rounded-[20px] border bg-surface p-4 ${low ? 'border-danger/40' : 'border-line'}`}
    >
      <span id={`stock-${eye}`} className="text-[13px] font-semibold text-muted">
        {label}
        {prescription && ` · ${formatPower(prescription.power)}`}
      </span>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={`Remove one ${eye} lens`}
          disabled={count === 0}
          onClick={() => setStock(eye, count - 1)}
          className={BTN}
        >
          <Minus aria-hidden="true" size={20} />
        </button>
        <output aria-live="polite" className="text-[32px] font-bold tabular-nums">
          {count}
        </output>
        <button type="button" aria-label={`Add one ${eye} lens`} onClick={() => setStock(eye, count + 1)} className={BTN}>
          <Plus aria-hidden="true" size={20} />
        </button>
      </div>
      <span className={`text-[13px] font-medium ${low ? 'text-danger' : 'text-muted'}`}>{note}</span>
    </div>
  );
}

export default function StockSection({ stock, prescriptions, replacementDays }) {
  return (
    <section aria-labelledby="stock-h" className="flex flex-col gap-2">
      <h2 id="stock-h" className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
        Spare lenses
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <EyeStock
          eye="left"
          label="Left"
          row={stock.left}
          prescription={prescriptions.left}
          replacementDays={replacementDays}
        />
        <EyeStock
          eye="right"
          label="Right"
          row={stock.right}
          prescription={prescriptions.right}
          replacementDays={replacementDays}
        />
      </div>
    </section>
  );
}
