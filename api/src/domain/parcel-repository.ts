import type { Parcel } from './parcel.js';

export interface ParcelRepository {
    create(parcel: Parcel): Promise<void>;
}