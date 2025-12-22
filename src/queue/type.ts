import { RawEventTrackParams } from "../../sdks/sdk-server-side-typescript/src/resources/raw-events";

export type IFormoEvent = RawEventTrackParams;

// event queue interface
export interface IEventQueue {
  enqueue(
    event: IFormoEvent,
    callback?: (...args: unknown[]) => void
  ): Promise<void>;
  flush(callback?: (...args: unknown[]) => void): Promise<void>;
}
