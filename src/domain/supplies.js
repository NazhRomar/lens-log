import { addDays, differenceInCalendarDays } from 'date-fns';

export const SUPPLY_DEFAULTS = {
  case: {
    label: 'Lens case',
    noun: 'case',
    newLabel: 'New case',
    verb: 'Replace',
    discardAfterDays: 90,
    minDays: 14,
    maxDays: 180,
    hint: 'Replace your lens case at least every 3 months, or sooner if it is cracked or dirty.',
  },
  solution: {
    label: 'Solution bottle',
    noun: 'bottle',
    newLabel: 'New bottle',
    verb: 'Discard',
    discardAfterDays: 90,
    minDays: 7,
    maxDays: 365,
    hint: 'Check the bottle for how long it lasts once opened.',
  },
};

/** Status of the case or solution bottle. state: 'ok' | 'soon' (≤ 14 days) | 'overdue' */
export function supplyStatus(supply, now) {
  const day = differenceInCalendarDays(now, supply.openedAt) + 1;
  const daysLeft = supply.discardAfterDays - day + 1;
  let state = 'ok';
  if (daysLeft <= 0) state = 'overdue';
  else if (daysLeft <= 14) state = 'soon';
  return {
    day,
    daysLeft,
    replaceBy: addDays(supply.openedAt, supply.discardAfterDays),
    progress: Math.min(1, day / supply.discardAfterDays),
    state,
  };
}

export function isLowStock(stock) {
  return stock.count < stock.lowThreshold;
}

/** "≈ 8 weeks" of lenses left, given how long each lens lasts. */
export function stockDuration(count, replacementDays) {
  const days = count * replacementDays;
  if (days === 0) return null;
  if (days < 14) return `≈ ${days} ${days === 1 ? 'day' : 'days'}`;
  if (days < 90) return `≈ ${Math.round(days / 7)} weeks`;
  return `≈ ${Math.round(days / 30)} months`;
}

/** Prescription numbers: signed with a real minus sign, fixed decimals. */
export function formatPower(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (n === 0) return '0.00';
  return `${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(2)}`;
}

export function formatNumber(v, decimals = 1) {
  return v == null || v === '' ? '—' : Number(v).toFixed(decimals);
}
