import { SDKServerSide } from "../sdks/sdk-server-side-typescript";
import { randomUUID } from "crypto";
import {
  TrackAPIEvent,
  IdentifyAPIEvent,
  validateTrackEvent,
  validateIdentifyEvent,
} from "./validators";
import { getChecksumAddress, normalizeTrackProperties } from "./utils";
import { EventQueue } from "./queue";
import type { AnalyticsOptions } from "./types";

const VERSION = "0";
const LIBRARY_NAME = "Formo Node SDK";
const LIBRARY_VERSION = "1.0.0";

// Re-export types for consumers
export type { TrackAPIEvent, IdentifyAPIEvent, AnalyticsOptions };
export { ValidationError } from "./validators";

/**
 * Formo Analytics SDK for Node.js
 *
 * Server-side analytics for tracking events and identifying users.
 * Events are batched and sent efficiently with retry logic.
 *
 * @example
 * ```typescript
 * const analytics = new FormoAnalytics("your-write-key", {
 *   flushAt: 20,      // Flush after 20 events
 *   flushInterval: 30000, // Flush every 30 seconds
 * });
 *
 * // Track an event
 * await analytics.track({
 *   anonymousId: "device-uuid",
 *   event: "Purchase Completed",
 *   properties: { orderId: "123", total: 99.99 }
 * });
 *
 * // Identify a user
 * await analytics.identify({
 *   anonymousId: "device-uuid",
 *   userId: "user-123",
 *   traits: { email: "user@example.com", plan: "premium" }
 * });
 *
 * // Flush pending events before shutdown
 * await analytics.flush();
 * ```
 */
export class FormoAnalytics {
  private client: SDKServerSide;
  private queue: EventQueue;

  /**
   * Create a new FormoAnalytics instance
   * @param writeKey - Your Formo project write key
   * @param options - Optional configuration
   */
  constructor(writeKey: string, options: AnalyticsOptions = {}) {
    if (!writeKey || typeof writeKey !== "string") {
      throw new Error("writeKey is required and must be a string");
    }

    this.client = new SDKServerSide({
      bearerToken: writeKey,
      environment: "environment_1", // events.formo.so
    });

    this.queue = new EventQueue(this.client, options);
  }

  /**
   * Track a custom event
   *
   * @param options - Track options
   * @param options.anonymousId - Required. Device/session identifier
   * @param options.event - Required. Event name
   * @param options.userId - Optional. Your user identifier
   * @param options.properties - Optional. Event properties
   * @param options.address - Optional. Ethereum wallet address
   * @param options.context - Optional. Additional context
   *
   * @throws ValidationError if options are invalid
   */
  async track(event: TrackAPIEvent): Promise<void> {
    // Validate inputs before queuing
    validateTrackEvent(event);

    const now = new Date().toISOString();
    const checksumAddress = getChecksumAddress(event.address);

    await this.queue.enqueue({
      type: "track",
      channel: "server",
      version: VERSION,
      anonymous_id: event.anonymousId,
      user_id: event.userId ?? null,
      event: event.event,
      properties: normalizeTrackProperties(event.properties),
      context: {
        library_name: LIBRARY_NAME,
        library_version: LIBRARY_VERSION,
        ...event.context,
      },
      address: checksumAddress,
      original_timestamp: now,
      sent_at: now,
      message_id: randomUUID(),
    });
  }

  /**
   * Identify a user
   *
   * @param options - Identify options
   * @param options.anonymousId - Required. Device/session identifier
   * @param options.userId - Required. Your user identifier
   * @param options.traits - Optional. User traits/properties
   * @param options.address - Optional. Ethereum wallet address
   * @param options.context - Optional. Additional context
   *
   * @throws ValidationError if options are invalid
   */
  async identify(event: IdentifyAPIEvent): Promise<void> {
    // Validate inputs before queuing
    validateIdentifyEvent(event);

    const now = new Date().toISOString();
    const checksumAddress = getChecksumAddress(event.address);

    await this.queue.enqueue({
      type: "identify",
      channel: "server",
      version: VERSION,
      anonymous_id: event.anonymousId,
      user_id: event.userId,
      properties: event.traits ?? {},
      context: {
        library_name: LIBRARY_NAME,
        library_version: LIBRARY_VERSION,
        ...event.context,
      },
      address: checksumAddress,
      original_timestamp: now,
      sent_at: now,
      message_id: randomUUID(),
    });
  }

  /**
   * Flush all pending events
   * Call this before process shutdown to ensure all events are sent
   */
  async flush(): Promise<void> {
    await this.queue.flush();
  }
}
