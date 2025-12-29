import { IFormoEvent } from "../types";

export type { IFormoEvent };

// Event queue interface
export interface IEventQueue {
  enqueue(
    event: IFormoEvent,
    callback?: (...args: unknown[]) => void
  ): Promise<void>;
  flush(callback?: (...args: unknown[]) => void): Promise<void>;
}
