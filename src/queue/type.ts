import { RawEventTrackParams } from "../../sdks/sdk-server-side-typescript/src/resources/raw-events";

// Aligned with web SDK naming: IFormoEvent
export type IFormoEvent = RawEventTrackParams;

/**
 * Event queue interface
 * Aligned with web SDK IEventQueue
 */
export interface IEventQueue {
  enqueue(
    event: IFormoEvent,
    callback?: (...args: unknown[]) => void
  ): Promise<void>;
  flush(callback?: (...args: unknown[]) => void): Promise<void>;
}
