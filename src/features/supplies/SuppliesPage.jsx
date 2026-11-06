import { useLiveQuery } from 'dexie-react-hooks';
import PageHeader from '../../components/layout/PageHeader';
import { LENS_TYPES, db } from '../../db/db';
import { useStock, useSupplies } from '../../hooks/useLensData';
import { useNow } from '../../hooks/useNow';
import { useSettings } from '../../hooks/useSettings';
import PrescriptionCard from './PrescriptionCard';
import StockSection from './StockSection';
import SupplyCard from './SupplyCard';

function usePrescriptions() {
  return useLiveQuery(async () => {
    const rows = await db.prescriptions.toArray();
    return Object.fromEntries(rows.map((r) => [r.eye, r]));
  }, []);
}

export default function SuppliesPage() {
  const now = useNow(60000);
  const settings = useSettings();
  const stock = useStock();
  const supplies = useSupplies();
  const prescriptions = usePrescriptions();

  const header = <PageHeader title="Supplies" subtitle="Lenses, case, solution and prescription" />;
  if ([settings, stock, supplies, prescriptions].some((v) => v === undefined)) return header;

  const lensLabel =
    settings.lensType === 'custom'
      ? `${settings.replacementDays}-day`
      : LENS_TYPES[settings.lensType].label;

  return (
    <>
      {header}
      <div className="flex flex-col gap-5">
        <StockSection stock={stock} prescriptions={prescriptions} replacementDays={settings.replacementDays} />

        <section aria-labelledby="care-h" className="flex flex-col gap-2">
          <h2 id="care-h" className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
            Case and solution
          </h2>
          <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
            <SupplyCard id="case" supply={supplies.case} now={now} />
            <SupplyCard id="solution" supply={supplies.solution} now={now} last />
          </div>
        </section>

        <PrescriptionCard prescriptions={prescriptions} brand={settings.brand} lensLabel={lensLabel} />
      </div>
    </>
  );
}
