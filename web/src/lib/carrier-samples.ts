import type { Carrier } from './types';

// Example payloads in each carrier's own format, used to simulate a delivery.
// The API's carrier adapters translate them into a parcel.

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function between(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function code(prefix: string): string {
  return `${prefix}-${between(1000, 9999)}`;
}

export function samplePayload(carrier: Carrier): unknown {
  switch (carrier) {
    case 'andorinha':
      return {
        codigo: code('AN'),
        dimensoes: { largura: between(15, 38), altura: pick([6, 9, 14, 18, 26]), profundidade: between(20, 55) },
      };
    case 'rapidex':
      return { ref: code('PT'), parcel_size: pick(['small', 'small', 'medium', 'large']) };
    case 'norte-express':
      return { shipment: { id: code('NX'), sizeCode: pick([1, 1, 2, 3]) } };
  }
}
