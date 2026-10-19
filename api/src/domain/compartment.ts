import { fits, type Size } from './size.js';

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

export type PlacementErrorCode =
| 'COMPARTMENT_OUT_OF_SERVICE'
| 'COMPARTMENT_OCCUPIED'
| 'PARCEL_TOO_LARGE';

export class PlacementError extends Error {
    readonly code: PlacementErrorCode;

    constructor(code: PlacementErrorCode) {
        super(code);
        this.name = 'PlacementError';
        this.code = code;
    }
}

export function placeParcel(compartment: Compartment, parcel: ParcelToPlace): Compartment{
    if(compartment.parcelId === parcel.id) {
        return compartment;
    }
    if (compartment.status === 'out_of_service'){
        throw new PlacementError('COMPARTMENT_OUT_OF_SERVICE');    
    }
    if (compartment.status === 'occupied') {
        throw new PlacementError('COMPARTMENT_OCCUPIED');
    }
    if (!fits(parcel.size, compartment.size)) {
        throw new PlacementError('PARCEL_TOO_LARGE');
    }
    return { ...compartment, status: 'occupied', parcelId: parcel.id};
}