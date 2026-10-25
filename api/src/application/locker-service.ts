import { placeParcel } from "../domain/compartment.js";
import type { CompartmentRepository } from "../domain/compartment-repository.js";
import { DomainError } from "../domain/errors.js";
import type { Parcel } from "../domain/parcel.js";
import type { ParcelRepository } from "../domain/parcel-repository.js";
import { suggestCompartment } from "../domain/suggest.js";

export class LockerService {
    constructor(
        private readonly compartments: CompartmentRepository,
        private readonly parcels: ParcelRepository,
    ) {}

    async placeParcel(parcelId: string, compartmentId?: string): Promise<Parcel>{
        const parcel = await this.parcels.findById(parcelId);
        if( !parcel) {
            throw new DomainError('PARCEL_NOT_FOUND');
        }
        if (parcel.status === 'picked_up') {
            throw new DomainError('PARCEL_ALREADY_PICKED_UP');
        }
        if (parcel.status === 'placed') {
            if (compartmentId === undefined || compartmentId === parcel.compartmentId) {
                return parcel;
            }
            throw new DomainError('PARCEL_ALREADY_PLACED');
        }

        const all = await this.compartments.findAll();
        const target =
            compartmentId === undefined
                ? suggestCompartment(all, parcel.size)
                : all.find((c) => c.id === compartmentId );
        if(!target) {
            throw new DomainError(
                compartmentId === undefined ? 'NO_COMPARTMENT_AVAILABLE' : 'COMPARTMENT_NOT_FOUND',
            );
        }
        
        placeParcel(target, parcel);

        const occupied = await this.compartments.occupy(target.id, parcel.id);
        if (!occupied) {
            throw new DomainError('COMPARTMENT_OCCUPIED');
        }
        await this.parcels.markPlaced(parcel.id, target.id);

        return { ...parcel, status: 'placed', compartmentId: target.id};
    }
}