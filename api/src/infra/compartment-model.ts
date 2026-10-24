import { Schema, model } from 'mongoose';
import type { CompartmentStatus } from '../domain/compartment.js';
import { SIZES, type Size } from '../domain/size.js';

export interface CompartmentDoc {
    _id: string;
    size: Size;
    status: CompartmentStatus;
    parcelId: string | null;
}

const compartmentSchema = new Schema<CompartmentDoc>(
    {
        _id: { type:String, required: true},
        size: { type: String, enum: SIZES, required: true},
        status: { type: String, enum: ['free', 'occupied', 'out_of_service'], required: true},
        parcelId: { type: String, default: null},
    },
    { versionKey: false},
);

export const CompartmentModel = model<CompartmentDoc>('Compartment', compartmentSchema);