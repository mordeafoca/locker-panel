import type { Carrier, NewParcelInput } from '../domain/parcel.js';

/**
 * Each carrier sends parcels in its own format. An adapter translates that
 * format into our model, so the rest of the API never sees carrier details
 * 
 */

export interface CarrierAdapter{
    readonly carrier: Carrier;
    toParcel(payload: unknown): NewParcelInput;

}