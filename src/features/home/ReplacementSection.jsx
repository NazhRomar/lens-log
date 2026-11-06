import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProgressRing from '../../components/ui/ProgressRing';
import { LENS_TYPES } from '../../db/db';
import { cycleStatus, sameSchedule } from '../../domain/cycles';

const STATE = {
  ok: { ring: 'stroke-accent', track: 'stroke-track', border: '', badge: null },
  soon: { ring: 'stroke-warn-bar', track: 'stroke-warn-soft', border: 'border-warn-bar/50', badge: ['Soon', 'bg-warn-soft text-warn'] },
  due: { ring: 'stroke-danger', track: 'stroke-danger-soft', border: 'border-danger/50', badge: ['Today', 'bg-danger-soft text-danger'] },
  overdue: { ring: 'stroke-danger', track: 'stroke-danger-soft', border: 'border-danger/50', badge: ['Overdue', 'bg-danger-soft text-danger'] },
};

function RingCenter({ daysLeft }) {
  if (daysLeft > 0) {
    return (
      <>
        <span className="text-[26px] leading-none font-bold">{daysLeft}</span>
        <span className="text-[11px] font-medium text-muted">{daysLeft === 1 ? 'day left' : 'days left'}</span>
      </>
    );
  }
  if (daysLeft === 0) return <span className="text-base font-bold text-danger">Today</span>;
  return (
    <>
      <span className="text-[26px] leading-none font-bold text-danger">{-daysLeft}</span>
      <span className="text-[11px] font-medium text-danger">{daysLeft === -1 ? 'day over' : 'days over'}</span>
    </>
  );
}

function srLabel(s) {
  if (s.daysLeft > 0) return `Day ${s.day} of ${s.total}, ${s.daysLeft} ${s.daysLeft === 1 ? 'day' : 'days'} left`;
  if (s.daysLeft === 0) return `Day ${s.day} of ${s.total}, replace today`;
  return `Replacement overdue by ${-s.daysLeft} ${s.daysLeft === -1 ? 'day' : 'days'}`;
}

function Badge({ state }) {
  const b = STATE[state].badge;
  if (!b) return null;
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b[1]}`}>{b[0]}</span>;
}

function EyeCard({ label, cycle, now }) {
  if (!cycle) {
    return (
      <Card className="flex flex-col items-start gap-2 p-4">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <span className="text-sm text-fg-soft">No lens tracked</span>
      </Card>
    );
  }
  const s = cycleStatus(cycle, now);
  const st = STATE[s.state];
  return (
    <Card className={`flex flex-col items-center gap-2.5 p-4 ${st.border}`}>
      <div className="flex items-center justify-between self-stretch">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <Badge state={s.state} />
      </div>
      <ProgressRing progress={s.progress} colorClass={st.ring} trackClass={st.track} label={`${label}: ${srLabel(s)}`}>
        <RingCenter daysLeft={s.daysLeft} />
      </ProgressRing>
      <span className="flex flex-col items-center text-center text-[13px]">
        <span className="text-fg-soft">
          Day {s.day} of {s.total}
        </span>
        <span className="text-muted">New lens {format(s.replaceBy, 'MMM d')}</span>
      </span>
    </Card>
  );
}

function BothCard({ cycle, now }) {
  const s = cycleStatus(cycle, now);
  const st = STATE[s.state];
  return (
    <Card className={`flex items-center gap-5 p-4 ${st.border}`}>
      <ProgressRing progress={s.progress} colorClass={st.ring} trackClass={st.track} label={`Both eyes: ${srLabel(s)}`}>
        <RingCenter daysLeft={s.daysLeft} />
      </ProgressRing>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold">Both eyes</span>
          <Badge state={s.state} />
        </div>
        <span className="text-sm text-fg-soft">
          Day {s.day} of {s.total}
        </span>
        <span className="text-sm text-muted">
          {s.daysLeft < 0 ? 'Was due' : 'New pair on'} {format(s.replaceBy, 'EEE, MMM d')}
        </span>
      </div>
    </Card>
  );
}

export default function ReplacementSection({ cycles, settings, now, onReplace }) {
  const { left, right } = cycles;
  const typeLabel = LENS_TYPES[settings.lensType]?.label ?? `${settings.replacementDays}-day`;

  if (!left && !right) {
    return (
      <Card className="flex flex-col gap-3">
        <h2 className="m-0 text-[15px] font-semibold">Track your lenses</h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Log when you open a new pack and Lens Log counts down to your next pair ({typeLabel.toLowerCase()} lenses).
        </p>
        <Button onClick={onReplace}>I opened a new pack</Button>
      </Card>
    );
  }

  const combined = settings.eyesLinked && sameSchedule(left, right);

  return (
    <section aria-labelledby="replace-h" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 id="replace-h" className="m-0 text-[15px] font-semibold">
          Replace in
        </h2>
        <span className="text-[13px] text-muted">{typeLabel} lenses</span>
      </div>
      {combined ? (
        <BothCard cycle={left} now={now} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <EyeCard label="Left eye" cycle={left} now={now} />
          <EyeCard label="Right eye" cycle={right} now={now} />
        </div>
      )}
      <Button variant="secondary" onClick={onReplace} className="min-h-12 text-[15px]">
        Replace lenses
      </Button>
    </section>
  );
}
