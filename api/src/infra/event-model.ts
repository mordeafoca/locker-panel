import { Schema, Types, model } from 'mongoose';
import { EVENT_TYPES, type EventType } from '../domain/event.js';
import { CARRIERS, type Carrier } from '../domain/parcel.js';

export interface EventDoc {
    _id: Types.ObjectId;
    type: EventType;
    parcelId: string;
    carrier: Carrier;
    compartmentId: string | null;
    at: Date;
}

const eventSchema = new Schema<EventDoc>(
    {
        type: { type: String, enum: EVENT_TYPES, required: true },
        parcelId: { type: String, required: true },
        carrier: { type: String, enum: CARRIERS, required: true },
        compartmentId: { type: String, default: null},
        at: { type: Date, required: true, default: () => new Date() },
    },
    {versionKey: false},
);

eventSchema.index({ at: -1 });

export const EventModel = model<EventDoc>('Event', eventSchema);