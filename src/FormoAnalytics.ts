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
 *   address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
 *   properties: { email: "user@example.com", plan: "premium" }
 * });
 *
 * // Flush pending events before shutdown
 * await analytics.flush();
 * ```
 */
export class FormoAnalytics {
  private queue: EventQueue;

  /**
   * Create a new FormoAnalytics instance
   * @param writeKey - Your Formo project write key
   * @param options - Optional configuration
   */
  constructor(
    public readonly writeKey: string,
    options: AnalyticsOptions = {}
  ) {
    if (!writeKey || typeof writeKey !== "string") {
      throw new Error("writeKey is required and must be a string");
    }

    this.queue = new EventQueue(writeKey, options);
  }

  /**
   * Track a custom event
   *
   * @param event - Track event
   * @param event.event - Required. Event name
   * @param event.anonymousId - Optional. Device/session identifier (generated if not provided)
   * @param event.userId - Optional. Your user identifier
   * @param event.properties - Optional. Event properties
   * @param event.address - Optional. Ethereum wallet address
   * @param event.context - Optional. Additional context
   *
   * @throws ValidationError if options are invalid
   */
  async track(event: TrackAPIEvent): Promise<void> {
    // Auto-generate anonymousId if not provided
    if (!event.anonymousId) {
      event.anonymousId = randomUUID();
    }

    // Validate inputs before queuing
    validateTrackEvent(event);

    const now = new Date().toISOString();
    const checksumAddress = getChecksumAddress(event.address);

    await this.queue.enqueue({
      type: "track",
      channel: "server",
      version: VERSION,
      anonymous_id: event.anonymousId!,
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
   * @param event - Identify event
   * @param event.address - Required. Ethereum wallet address
   * @param event.anonymousId - Optional. Device/session identifier (generated if not provided)
   * @param event.userId - Optional. Your user identifier
   * @param event.properties - Optional. User traits/properties
   * @param event.context - Optional. Additional context
   *
   * @throws ValidationError if options are invalid
   */
  async identify(event: IdentifyAPIEvent): Promise<void> {
    // Auto-generate anonymousId if not provided
    if (!event.anonymousId) {
      event.anonymousId = randomUUID();
    }

    // Validate inputs before queuing
    validateIdentifyEvent(event);

    const now = new Date().toISOString();
    const checksumAddress = getChecksumAddress(event.address);

    await this.queue.enqueue({
      type: "identify",
      channel: "server",
      version: VERSION,
      anonymous_id: event.anonymousId!,
      user_id: event.userId ?? null,
      properties: event.properties ?? {},
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
