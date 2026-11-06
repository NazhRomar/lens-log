import { addDays, differenceInCalendarDays } from 'date-fns';

export const SUPPLY_DEFAULTS = {
  case: { label: 'Lens case', discardAfterDays: 90 },
  solution: { label: 'Solution bottle', discardAfterDays: 90 },
};

/** Status of the case or solution bottle. */
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
