import { format, isToday } from 'date-fns';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { putIn, takeOut } from '../../db/actions';
import { HOUR, formatDuration, wearState } from '../../domain/wear';

const BAR = { ok: 'bg-accent', near: 'bg-warn-bar', over: 'bg-danger' };

function timeLabel(ms) {
  return isToday(ms) ? format(ms, 'h:mm a') : format(ms, 'EEE h:mm a');
}

/**
 * Wear timer. Shows the total worn today against the daily limit, so taking
 * lenses out and putting them back in still counts toward the same limit.
 */
export default function WearCard({ active, wornTodayMs, lastEndedAt, now, maxHours }) {
  if (active) {
    // `now` ticks every few seconds and can be slightly older than a session that just started.
    const sessionMs = Math.max(0, Math.max(now, Date.now()) - active.startedAt);
    const ms = Math.max(wornTodayMs, sessionMs);
    const earlierToday = ms - sessionMs > 60_000;
    const state = wearState(ms, maxHours);
    const pct = Math.min(100, (ms / (maxHours * HOUR)) * 100);
    return (
      <Card aria-label="Wear timer" className={`flex flex-col gap-3.5 ${state === 'over' ? 'border-danger/40' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-2.5 py-1.5 text-[13px] font-semibold text-ok">
            <span className="size-2 rounded-full bg-ok" />
            Wearing now
          </span>
          <span className="text-[13px] text-muted">In at {timeLabel(active.startedAt)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tighter tabular-nums">{formatDuration(ms)}</span>
          <span className="text-[15px] text-muted">of {maxHours}h today</span>
        </div>
        {earlierToday && (
          <p className="-mt-2 m-0 text-[13px] text-muted">This time: {formatDuration(sessionMs)}</p>
        )}
        <div
          role="progressbar"
          aria-label="Wear time"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          className="h-2 overflow-hidden rounded-full bg-track"
        >
          <div className={`h-full rounded-full ${BAR[state]}`} style={{ width: `${pct}%` }} />
        </div>
        {state === 'near' && <p className="m-0 text-sm font-medium text-warn">Less than an hour left.</p>}
        {state === 'over' && (
          <p className="m-0 text-sm font-medium text-danger">Past your {maxHours}h limit. Take your lenses out soon.</p>
        )}
        <Button variant="dark" onClick={() => takeOut()}>
          Take lenses out
        </Button>
      </Card>
    );
  }

  return (
    <Card aria-label="Wear timer" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-bg px-2.5 py-1.5 text-[13px] font-semibold text-muted">
          <span className="size-2 rounded-full bg-muted" />
          Not wearing
        </span>
        {lastEndedAt && <span className="text-[13px] text-muted">Out at {timeLabel(lastEndedAt)}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tighter tabular-nums">{formatDuration(wornTodayMs)}</span>
        <span className="text-[15px] text-muted">worn today</span>
      </div>
      <p className="m-0 text-sm leading-normal text-muted">Wash and dry your hands before putting your lenses in.</p>
      <Button onClick={putIn}>Put lenses in</Button>
    </Card>
  );
}
