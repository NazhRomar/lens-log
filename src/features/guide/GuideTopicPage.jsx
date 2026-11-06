import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { DISCLAIMER, getTopic } from './content';
import { ILLUSTRATIONS } from './illustrations';
import { useBackHandler } from '../../platform/back';

export default function GuideTopicPage() {
  const { topicId } = useParams();
  // key resets the step index when moving to another topic
  return <Topic key={topicId} topicId={topicId} />;
}

function Topic({ topicId }) {
  const topic = getTopic(topicId);
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  // Android back button: previous step first, then back to the guide list.
  useBackHandler(() => {
    if (index === 0) return false;
    setIndex(index - 1);
    document.querySelector('main')?.scrollTo({ top: 0 });
    return true;
  });

  if (!topic) return <Navigate to="/guide" replace />;

  const steps = topic.steps;
  const step = steps[index];
  const last = index === steps.length - 1;
  const Art = step?.art ? ILLUSTRATIONS[step.art] : null;

  function go(i) {
    setIndex(i);
    document.querySelector('main')?.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="-ml-3 flex items-center gap-2">
        <Link to="/guide" aria-label="Back to Guide" className="flex size-11 items-center justify-center rounded-xl text-fg">
          <ChevronLeft aria-hidden="true" size={22} />
        </Link>
        <h1 className="m-0 flex-1 text-lg font-bold">{topic.title}</h1>
        <span className="text-[13px] font-semibold text-muted">
          Step {index + 1} of {steps.length}
        </span>
      </header>

      <div
        role="progressbar"
        aria-label="Guide progress"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={index + 1}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((_, i) => (
          <span key={i} className={`h-1 rounded-full ${i <= index ? 'bg-accent' : 'bg-track'}`} />
        ))}
      </div>

      {Art && (
        <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
          <Art />
        </div>
      )}

      <Card className="flex flex-col gap-2.5">
        <h2 className="m-0 text-xl font-bold tracking-tight">{step.title}</h2>
        <p className="m-0 text-[15px] leading-relaxed text-fg-soft">{step.body}</p>
      </Card>

      {step.tip && (
        <aside className="flex gap-3 rounded-2xl bg-warn-soft px-4 py-3.5 text-warn">
          <Info aria-hidden="true" size={20} className="mt-px flex-none" />
          <p className="m-0 text-sm leading-normal">{step.tip}</p>
        </aside>
      )}

      <p className="m-0 text-xs leading-relaxed text-muted">{DISCLAIMER}</p>

      {/* Fixed at the bottom of the screen so the buttons never move between steps. */}
      <div className="sticky bottom-0 -mx-5 -mb-8 mt-auto grid grid-cols-2 gap-3 border-t border-line bg-bg px-5 py-3">
        <Button variant="secondary" disabled={index === 0} onClick={() => go(index - 1)} className="text-fg">
          Back
        </Button>
        <Button onClick={() => (last ? navigate('/guide') : go(index + 1))}>{last ? 'Done' : 'Next'}</Button>
      </div>
    </div>
  );
}
