import type { Carrier, Compartment, Size } from './types';

// Height of each door, in grid rows. An L door is three times an S door.
export const SIZE_ROWS: Record<Size, number> = { S: 1, M: 2, L: 3 };

// Same rule as the API (api/src/domain/size.ts), used here only to highlight
// which doors can take the selected parcel. The API still has the final say.
export function fits(parcel: Size, compartment: Size): boolean {
  return SIZE_ROWS[compartment] >= SIZE_ROWS[parcel];
}

export function canTake(compartment: Compartment, size: Size): boolean {
  return compartment.status === 'free' && fits(size, compartment.size);
}

// Doors are laid out column by column, small ones first, like the hardware.
export function doorOrder(compartments: Compartment[]): Compartment[] {
  return [...compartments].sort(
    (a, b) => SIZE_ROWS[a.size] - SIZE_ROWS[b.size] || a.id.localeCompare(b.id),
  );
}

export const CARRIER_NAMES: Record<Carrier, string> = {
  andorinha: 'Andorinha',
  rapidex: 'Rapidex',
  'norte-express': 'Norte Express',
};
