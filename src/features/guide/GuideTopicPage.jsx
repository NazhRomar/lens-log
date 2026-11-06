import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { DISCLAIMER, getTopic } from './content';
import { ILLUSTRATIONS } from './illustrations';

export default function GuideTopicPage() {
  const { topicId } = useParams();
  // key resets the step index when moving to another topic
  return <Topic key={topicId} topicId={topicId} />;
}

function Topic({ topicId }) {
  const topic = getTopic(topicId);
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  if (!topic) return <Navigate to="/guide" replace />;

  const steps = topic.steps;
  const step = steps[index];
  const last = index === steps.length - 1;
  const Art = step?.art ? ILLUSTRATIONS[step.art] : null;

  return (
    <div className="flex flex-col gap-4">
      <header className="-ml-3 flex items-center gap-2">
        <Link to="/guide" aria-label="Back to Guide" className="flex size-11 items-center justify-center rounded-xl text-fg">
          <ChevronLeft aria-hidden="true" size={22} />
        </Link>
        <h1 className="m-0 flex-1 text-lg font-bold">{topic.title}</h1>
        {steps.length > 0 && (
          <span className="text-[13px] font-semibold text-muted">
            Step {index + 1} of {steps.length}
          </span>
        )}
      </header>

      {steps.length === 0 ? (
        <Card>
          <p className="m-0 text-[15px] text-fg-soft">This guide is still being written.</p>
        </Card>
      ) : (
        <>
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)} className="text-fg">
              Back
            </Button>
            <Button onClick={() => (last ? navigate('/guide') : setIndex(index + 1))}>{last ? 'Done' : 'Next'}</Button>
          </div>
        </>
      )}

      <p className="m-0 text-xs leading-relaxed text-muted">{DISCLAIMER}</p>
    </div>
  );
}
