import PageHeader from '../../components/layout/PageHeader';
import { useNow } from '../../hooks/useNow';
import { useSettings } from '../../hooks/useSettings';
import PastLenses from './PastLenses';
import WearChart from './WearChart';

export default function HistoryPage() {
  const tick = useNow(60000);
  const now = Math.max(tick, Date.now());
  const settings = useSettings();

  return (
    <>
      <PageHeader title="History" subtitle="Wear time and past lenses" />
      {settings && (
        <div className="flex flex-col gap-5">
          <WearChart now={now} maxHours={settings.maxWearHours} />
          <PastLenses />
        </div>
      )}
    </>
  );
}
