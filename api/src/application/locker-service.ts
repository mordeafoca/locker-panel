import { placeParcel, pickUpParcel } from "../domain/compartment.js";
import type { CompartmentRepository } from "../domain/compartment-repository.js";
import { DomainError } from "../domain/errors.js";
import { newParcel, type NewParcelInput, type Parcel } from "../domain/parcel.js";
import type { ParcelRepository } from "../domain/parcel-repository.js";
import { suggestCompartment } from "../domain/suggest.js";
import type { EventRepository } from "../domain/event-repository.js";

export class LockerService {
    constructor(
        private readonly compartments: CompartmentRepository,
        private readonly parcels: ParcelRepository,
        private readonly events: EventRepository,
    ) {}

    async createParcel(input: NewParcelInput): Promise<Parcel> {
        const parcel = newParcel(input);
        await this.parcels.create(parcel);
        await this.events.record({
            type: 'parcel_created',
            parcelId: parcel.id,
            carrier: parcel.carrier,
            compartmentId: null,
        });
        return parcel;
    }

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

        await this.events.record({
            type: 'parcel_placed',
            parcelId: parcel.id,
            carrier: parcel.carrier,
            compartmentId: target.id,
        });

        return { ...parcel, status: 'placed', compartmentId: target.id};
    }


    async pickUpParcel(parcelId: string): Promise<Parcel> {
        const parcel = await this.parcels.findById(parcelId);
        if(!parcel){
            throw new DomainError('PARCEL_NOT_FOUND');
        }
        if(parcel.status === 'picked_up'){
            return parcel;
        }
        if(parcel.status !== 'placed' || parcel.compartmentId === null) {
            throw new DomainError('PARCEL_NOT_PLACED');
        }

        const all = await this.compartments.findAll();
        const compartment = all.find((c) => c.id === parcel.compartmentId);
        if(!compartment) {
            throw new DomainError('COMPARTMENT_NOT_FOUND');
        }

        const released = pickUpParcel(compartment, parcel.id);

        const ok = await this.compartments.release(compartment.id, parcel.id, released.status);
        if(!ok){
            throw new DomainError('PARCEL_NOT_IN_COMPARTMENT');
        }
        await this.parcels.markPickedUp(parcel.id);

        await this.events.record({
            type: 'parcel_picked_up',
            parcelId: parcel.id,
            carrier: parcel.carrier,
            compartmentId: compartment.id,
        });

        return { ...parcel, status: 'picked_up'};
    }
}