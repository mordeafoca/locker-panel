import { Schema, model } from 'mongoose';
import { CARRIERS, type Carrier, type ParcelStatus } from '../domain/parcel.js';
import { SIZES, type Size } from '../domain/size.js';

export interface ParcelDoc {
    _id: string;
    size: Size;
    carrier: Carrier;
    status: ParcelStatus;
    compartmentId: string | null;
}

const parcelSchema = new Schema<ParcelDoc>(
    {
        _id: { type: String, required: true },
        size: { type: String, enum: SIZES, required: true},
        carrier: { type: String, enum: CARRIERS, required: true },
        status: { type: String, enum: ['created', 'placed', 'picked_up'], required: true },
        compartmentId: { type: String, default: null },
    },
    { versionKey: false },
);

export const ParcelModel = model<ParcelDoc>('Parcel', parcelSchema);