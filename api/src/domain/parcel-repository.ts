import type { Parcel, Carrier, ParcelStatus } from './parcel.js';

export interface ParcelFilter{
    carrier?: Carrier;
    status?: ParcelStatus;
}

export interface ParcelRepository {
    create(parcel: Parcel): Promise<void>;
    findById(id: string): Promise<Parcel | null>;
    markPlaced(parcelId: string, compartmentId: string): Promise<void>;
    markPickedUp(parcelId: string): Promise<void>;
    findAll(filter: ParcelFilter): Promise<Parcel[]>
}