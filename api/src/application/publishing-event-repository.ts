import type { ChangeNotifier } from '../domain/change-notifier.js';
import type { LockerEvent, NewLockerEvent } from '../domain/event.js';
import type { EventRepository } from '../domain/event-repository.js';

export class PublishingEventRepository implements EventRepository {
  constructor(
    private readonly inner: EventRepository,
    private readonly notifier: ChangeNotifier,
  ) {}

  async record(event: NewLockerEvent): Promise<void> {
    await this.inner.record(event);
    await this.notifier.publish(event);
  }

  latest(limit: number): Promise<LockerEvent[]> {
    return this.inner.latest(limit);
  }
}