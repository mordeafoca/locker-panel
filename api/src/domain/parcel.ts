import type { Size } from './size.js';

export const CARRIERS = ['andorinha', 'rapidex', 'norte-express'] as const;

export type Carrier = (typeof CARRIERS)[number];

export const PARCEL_STATUSES = ['created', 'placed', 'picked_up'] as const;
export type ParcelStatus = (typeof PARCEL_STATUSES)[number];

export interface Parcel {
    id: string;
    size: Size;
    carrier: Carrier;
    status: ParcelStatus;
    compartmentId: string | null;
}

export interface NewParcelInput {
    id: string;
    size: Size;
    carrier: Carrier;
}

export function newParcel(input: NewParcelInput): Parcel {
    return { ...input, status: 'created', compartmentId: null};
}