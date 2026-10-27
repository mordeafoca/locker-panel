import { describe, it, expect, vi } from 'vitest';
import { PublishingEventRepository } from '../../src/application/publishing-event-repository.js';
import type { NewLockerEvent } from '../../src/domain/event.js';
import { InMemoryNotifier } from '../../src/infra/in-memory-notifier.js';

const change: NewLockerEvent = {
  type: 'parcel_placed',
  parcelId: 'P1',
  carrier: 'rapidex',
  compartmentId: 'C01',
};

describe('PublishingEventRepository', () => {
  it('grava o evento e avisa quem está à escuta', async () => {
    const inner = { record: vi.fn(async () => {}), latest: vi.fn(async () => []) };
    const notifier = new InMemoryNotifier();
    const listener = vi.fn();
    notifier.subscribe(listener);

    await new PublishingEventRepository(inner, notifier).record(change);

    expect(inner.record).toHaveBeenCalledWith(change);
    expect(listener).toHaveBeenCalledWith(change);
  });

  it('não avisa ninguém se a gravação falhar', async () => {
    const inner = { record: vi.fn(async () => { throw new Error('db down'); }), latest: vi.fn(async () => []) };
    const notifier = new InMemoryNotifier();
    const listener = vi.fn();
    notifier.subscribe(listener);

    await expect(new PublishingEventRepository(inner, notifier).record(change)).rejects.toThrow('db down');
    expect(listener).not.toHaveBeenCalled();
  });

  it('deixa de avisar depois de cancelar a subscrição', async () => {
    const notifier = new InMemoryNotifier();
    const listener = vi.fn();
    const unsubscribe = notifier.subscribe(listener);

    unsubscribe();
    await notifier.publish(change);

    expect(listener).not.toHaveBeenCalled();
  });
});