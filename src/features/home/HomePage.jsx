import { useState } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { ChevronRight, Settings, TriangleAlert } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { isLikelyForgotten, wornToday } from '../../domain/wear';
import {
  useActiveCycles,
  useActiveSession,
  useRecentSessions,
  useStock,
  useSupplies,
} from '../../hooks/useLensData';
import { useNow } from '../../hooks/useNow';
import { useSettings } from '../../hooks/useSettings';
import ForgottenSessionCard from './ForgottenSessionCard';
import ReplaceDialog from './ReplaceDialog';
import ReplacementSection from './ReplacementSection';
import SuppliesStrip from './SuppliesStrip';
import WearCard from './WearCard';

export default function HomePage() {
  const tick = useNow(15000);
  // Never older than the latest DB change (a session that just started must not read as negative).
  const now = Math.max(tick, Date.now());
  const settings = useSettings();
  const cycles = useActiveCycles();
  const active = useActiveSession();
  const recent = useRecentSessions();
  const supplies = useSupplies();
  const stock = useStock();
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [dismissedId, setDismissedId] = useState(null);

  const loading = [settings, cycles, active, recent, supplies, stock].some((v) => v === undefined);

  const header = (
    <PageHeader
      eyebrow={format(now, 'EEE, MMM d')}
      title="Lens Log"
      action={
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-fg-soft"
        >
          <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
        </Link>
      }
    />
  );

  if (loading) return header;

  const sessions = active && !recent.some((s) => s.id === active.id) ? [...recent, active] : recent;
  const lastEnded = sessions
    .filter((s) => s.endedAt)
    .reduce((latest, s) => (s.endedAt > latest ? s.endedAt : latest), 0);
  const showForgotten =
    active && active.id !== dismissedId && isLikelyForgotten(active, now, settings.maxWearHours);

  return (
    <>
      {header}
      <div className="flex flex-col gap-4">
        {showForgotten && (
          <ForgottenSessionCard
            key={active.id}
            session={active}
            now={now}
            maxHours={settings.maxWearHours}
            onDismiss={() => setDismissedId(active.id)}
          />
        )}

        <WearCard
          active={active}
          wornTodayMs={wornToday(sessions, now)}
          lastEndedAt={lastEnded || null}
          now={now}
          maxHours={settings.maxWearHours}
        />

        <ReplacementSection
          cycles={cycles}
          settings={settings}
          now={now}
          onReplace={() => setReplaceOpen(true)}
        />

        <SuppliesStrip supplies={supplies} stock={stock} now={now} />

        <Link
          to="/guide/red-flags"
          className="flex min-h-11 items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3.5 text-danger-strong no-underline"
        >
          <TriangleAlert aria-hidden="true" size={22} strokeWidth={1.8} />
          <span className="flex-1 text-sm font-semibold">Pain, redness or blurry vision? What to do</span>
          <ChevronRight aria-hidden="true" size={18} />
        </Link>
      </div>

      <ReplaceDialog
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        firstTime={!cycles.left && !cycles.right}
        stock={stock}
      />
    </>
  );
}
