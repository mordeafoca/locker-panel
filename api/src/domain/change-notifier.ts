import type { NewLockerEvent } from "./event.js";

export type ChangeHandler = (change: NewLockerEvent) => void;

//Tells whoever is listening that something in the locker changed
export interface ChangeNotifier{
    publish(change: NewLockerEvent): Promise<void>;
    subscribe(handler: ChangeHandler): () => void;
}