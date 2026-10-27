import type { ChangeHandler, ChangeNotifier } from "../domain/change-notifier.js";
import type { NewLockerEvent } from "../domain/event.js";

//Only reaches listeners in this process. Enough for tests and single API instance
export class InMemoryNotifier implements ChangeNotifier{
    private readonly handlers = new Set<ChangeHandler>();

    async publish(change: NewLockerEvent): Promise<void> {
        for (const handler of this.handlers) handler(change);
    }

    subscribe(handler: ChangeHandler): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }
}