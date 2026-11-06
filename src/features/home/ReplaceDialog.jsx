import { useEffect, useRef, useState } from 'react';
import { format, isToday, parse, setHours } from 'date-fns';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import { openLenses } from '../../db/actions';

const EYES = [
  { value: 'both', label: 'Both' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const REASONS = [
  { value: 'scheduled', label: 'On schedule' },
  { value: 'damaged', label: 'Torn' },
  { value: 'lost', label: 'Lost' },
];

/** Opened-on date → timestamp: now if today, otherwise noon that day. */
function toOpenedAt(dateStr) {
  const day = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isToday(day) ? Date.now() : setHours(day, 12).getTime();
}

/**
 * Bottom sheet for starting new lenses.
 * `firstTime` hides the reason (there is no previous lens to close).
 */
export default function ReplaceDialog({ open, onClose, firstTime, stock }) {
  const ref = useRef(null);
  const [eyes, setEyes] = useState('both');
  const [reason, setReason] = useState('scheduled');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) {
      setEyes('both');
      setReason('scheduled');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const selected = eyes === 'both' ? ['left', 'right'] : [eyes];
  const fromStock = selected.filter((e) => (stock?.[e]?.count ?? 0) > 0);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await openLenses({ eyes: selected, openedAt: toOpenedAt(date), reason: firstTime ? 'scheduled' : reason });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="replace-dialog-h"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90vh] w-full max-w-none rounded-t-[24px] border-0 bg-surface p-0 text-fg backdrop:bg-black/50 md:inset-0 md:m-auto md:max-w-md md:rounded-[24px]"
    >
      <form onSubmit={submit} className="flex flex-col gap-5 p-5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="flex items-center justify-between">
          <h2 id="replace-dialog-h" className="m-0 text-lg font-bold">
            {firstTime ? 'New pack opened' : 'Replace lenses'}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-muted hover:text-fg"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>

        <Segmented name="eyes" legend="Which lenses?" options={EYES} value={eyes} onChange={setEyes} />

        {!firstTime && (
          <Segmented name="reason" legend="Why?" options={REASONS} value={reason} onChange={setReason} />
        )}

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Opened on
          <input
            type="date"
            required
            value={date}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-fg"
          />
        </label>

        <p className="m-0 text-sm text-muted">
          {fromStock.length > 0
            ? `Takes ${fromStock.length === 2 ? 'one lens per eye' : `one ${fromStock[0]} lens`} from your stock.`
            : 'Your stock count is not affected (no lenses in stock).'}
        </p>

        <Button type="submit" disabled={saving}>
          {eyes === 'both' ? 'Start new pair' : `Start new ${eyes} lens`}
        </Button>
      </form>
    </dialog>
  );
}
