import CaseDry from './CaseDry';
import InsideOutCheck from './InsideOutCheck';
import RemovePinch from './RemovePinch';

/** Maps a step's `art` key to its illustration component. Steps without one show no image. */
export const ILLUSTRATIONS = {
  insideOut: InsideOutCheck,
  removePinch: RemovePinch,
  caseDry: CaseDry,
};
