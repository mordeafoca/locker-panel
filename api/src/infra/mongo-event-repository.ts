import type { LockerEvent, NewLockerEvent } from "../domain/event.js";
import type { EventRepository } from "../domain/event-repository.js";
import { EventModel, type EventDoc } from "./event-model.js";

function toDomain(doc: EventDoc): LockerEvent {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
}

export class MongoEventRepository implements EventRepository {
    async record(event: NewLockerEvent): Promise<void> {
        await EventModel.create(event);
    }

    async latest(limit: number): Promise<LockerEvent[]> {
        const docs = await EventModel.find().sort({ at: -1, _id: -1}).limit(limit).lean<EventDoc[]>();
        return docs.map(toDomain);
    }
}