import type { Parcel } from './parcel.js';

export interface ParcelRepository {
    create(parcel: Parcel): Promise<void>;
    findById(id: string): Promise<Parcel | null>;
    markPlaced(parcelId: string, compartmentId: string): Promise<void>;
}