import { Link } from 'react-router';
import { isLowStock, supplyStatus } from '../../domain/supplies';

function supplyText(supply, now) {
  if (!supply) return { text: 'Not set', cls: 'text-muted' };
  const s = supplyStatus(supply, now);
  if (s.daysLeft < 0) return { text: 'Replace now', cls: 'text-danger' };
  return { text: `${s.daysLeft} ${s.daysLeft === 1 ? 'day' : 'days'} left`, cls: s.state === 'soon' ? 'text-warn' : '' };
}

function Cell({ label, children, last }) {
  return (
    <Link
      to="/supplies"
      className={`flex min-h-11 flex-col gap-1 px-3 py-3.5 text-fg no-underline hover:bg-bg ${last ? '' : 'border-r border-line'}`}
    >
      <span className="text-xs text-muted">{label}</span>
      <span className="text-[15px] font-semibold">{children}</span>
    </Link>
  );
}

export default function SuppliesStrip({ supplies, stock, now }) {
  const caseT = supplyText(supplies.case, now);
  const solT = supplyText(supplies.solution, now);
  const eye = (key, short) => {
    const row = stock[key];
    const low = row && isLowStock(row);
    return <span className={low ? 'text-danger' : ''}>{`${short} ${row?.count ?? 0}`}</span>;
  };

  return (
    <nav aria-label="Supplies status" className="grid grid-cols-3 overflow-hidden rounded-[20px] border border-line bg-surface">
      <Cell label="Case">
        <span className={caseT.cls}>{caseT.text}</span>
      </Cell>
      <Cell label="Solution">
        <span className={solT.cls}>{solT.text}</span>
      </Cell>
      <Cell label="Stock" last>
        {eye('left', 'L')} · {eye('right', 'R')}
      </Cell>
    </nav>
  );
}
