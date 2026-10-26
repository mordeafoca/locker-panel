import type { Carrier } from './parcel.js';

export const EVENT_TYPES = ['parcel_created', 'parcel_placed', 'parcel_picked_up'] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface LockerEvent {
    id: string;
    type: EventType;
    parcelId: string;
    carrier: Carrier;
    compartmentId: string | null;
    at: Date;
}

export type NewLockerEvent = Omit<LockerEvent, 'id' | 'at'>;