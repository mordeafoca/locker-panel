// Mirrors the API contract. If the API changes, this file changes with it.

export const SIZES = ['S', 'M', 'L'] as const;
export type Size = (typeof SIZES)[number];

export const CARRIERS = ['andorinha', 'rapidex', 'norte-express'] as const;
export type Carrier = (typeof CARRIERS)[number];

export type CompartmentStatus = 'free' | 'occupied' | 'out_of_service';

export interface Compartment {
  id: string;
  size: Size;
  status: CompartmentStatus;
  parcelId: string | null;
}

export type ParcelStatus = 'created' | 'placed' | 'picked_up';

export interface Parcel {
  id: string;
  size: Size;
  carrier: Carrier;
  status: ParcelStatus;
  compartmentId: string | null;
}

export interface NewParcel {
  id: string;
  size: Size;
  carrier: Carrier;
}

export interface ParcelFilter {
  carrier?: Carrier;
  status?: ParcelStatus;
}
