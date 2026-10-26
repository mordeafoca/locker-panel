import type { LockerEvent, NewLockerEvent } from './event.js';

export interface EventRepository {
    record(event: NewLockerEvent): Promise<void>;
    latest(limit: number): Promise<LockerEvent[]>;
}