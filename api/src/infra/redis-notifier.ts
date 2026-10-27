import { createClient } from 'redis';
import type { ChangeHandler, ChangeNotifier } from '../domain/change-notifier.js';
import type { NewLockerEvent } from '../domain/event.js';
import { logger } from '../logger.js';

const CHANNEL = 'locker:changes';

/**
 * Publishes through Redis, so every API instance hears every change,
 * whichever instance made it. 
 **/ 
export class RedisNotifier implements ChangeNotifier {
  private readonly handlers = new Set<ChangeHandler>();

  private constructor(private readonly send: (message: string) => Promise<unknown>) {}

  static async connect(url: string): Promise<RedisNotifier> {
    const publisher = createClient({ url });
    const subscriber = publisher.duplicate();
    publisher.on('error', (err) => logger.error({ err }, 'redis publisher error'));
    subscriber.on('error', (err) => logger.error({ err }, 'redis subscriber error'));
    await Promise.all([publisher.connect(), subscriber.connect()]);

    const notifier = new RedisNotifier((message) => publisher.publish(CHANNEL, message));
    await subscriber.subscribe(CHANNEL, (message) => {
      const change = JSON.parse(message) as NewLockerEvent;
      for (const handler of notifier.handlers) handler(change);
    });
    return notifier;
  }

  async publish(change: NewLockerEvent): Promise<void> {
    await this.send(JSON.stringify(change));
  }

  subscribe(handler: ChangeHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}