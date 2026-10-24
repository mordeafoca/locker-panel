import { fits, type Size } from './size.js';
import { DomainError } from './errors.js';

export type CompartmentStatus = 'free' | 'occupied' | 'out_of_service';

export interface Compartment{
    id: string;
    size: Size;
    status: CompartmentStatus;
    parcelId: string | null;
}

export interface ParcelToPlace {
  id: string;
  size: Size;
}

export function placeParcel(compartment: Compartment, parcel: ParcelToPlace): Compartment{
    if(compartment.parcelId === parcel.id) {
        return compartment;
    }
    if (compartment.status === 'out_of_service'){
        throw new DomainError('COMPARTMENT_OUT_OF_SERVICE');    
    }
    if (compartment.status === 'occupied') {
        throw new DomainError('COMPARTMENT_OCCUPIED');
    }
    if (!fits(parcel.size, compartment.size)) {
        throw new DomainError('PARCEL_TOO_LARGE');
    }
    return { ...compartment, status: 'occupied', parcelId: parcel.id};
}

export function pickUpParcel(compartment: Compartment, parcelId: string): Compartment {
    if(compartment.parcelId !== parcelId) {
        throw new DomainError('PARCEL_NOT_IN_COMPARTMENT');
    }
    const status = compartment.status === 'out_of_service' ? 'out_of_service' : 'free';
    return { ...compartment, status, parcelId: null};
}