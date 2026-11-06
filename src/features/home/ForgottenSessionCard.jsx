import { useState } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { Moon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { takeOut } from '../../db/actions';
import { HOUR, formatDuration } from '../../domain/wear';

const toInput = (ms) => format(ms, "yyyy-MM-dd'T'HH:mm");

/** Shown when a session has run far past the max: "did you forget to log taking them out?" */
export default function ForgottenSessionCard({ session, now, maxHours, onDismiss }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => toInput(Math.min(now, session.startedAt + maxHours * HOUR)));

  return (
    <section aria-labelledby="forgot-h" className="flex flex-col gap-3 rounded-[20px] bg-warn-soft p-5 text-warn">
      <div className="flex items-start gap-3">
        <Moon aria-hidden="true" size={22} className="mt-0.5 flex-none" />
        <div className="flex flex-col gap-1">
          <h2 id="forgot-h" className="m-0 text-base font-bold">
            Did you take your lenses out?
          </h2>
          <p className="m-0 text-sm leading-normal">
            They've been logged in since {format(session.startedAt, 'EEE h:mm a')}, which is{' '}
            {formatDuration(now - session.startedAt)}. Sleeping in lenses raises the risk of eye infection.
          </p>
          <Link to="/guide/sleep" className="min-h-11 content-center text-sm font-semibold text-warn underline">
            What to do if you slept in them
          </Link>
        </div>
      </div>

      {editing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            takeOut(new Date(value).getTime(), true);
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            When did you take them out?
            <input
              type="datetime-local"
              required
              value={value}
              min={toInput(session.startedAt)}
              max={toInput(now)}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base text-fg"
            />
          </label>
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="text-fg" onClick={onDismiss}>
            Still wearing
          </Button>
          <Button onClick={() => setEditing(true)}>I took them out</Button>
        </div>
      )}
    </section>
  );
}
