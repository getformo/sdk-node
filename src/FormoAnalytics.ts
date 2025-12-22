import { SDKServerSide } from "../sdks/sdk-server-side-typescript";
import { randomUUID } from "crypto";
import {
  TrackOptions,
  IdentifyOptions,
  validateTrackOptions,
  validateIdentifyOptions,
} from "./validators";
import { getChecksumAddress } from "./utils";

const VERSION = "0";
const LIBRARY_NAME = "Formo Node SDK";
const LIBRARY_VERSION = "1.0.0";

/**
 * Re-export types for consumers
 */
export type { TrackOptions, IdentifyOptions };
export { ValidationError } from "./validators";

/**
 * Formo Analytics SDK for Node.js
 *
 * Server-side analytics for tracking events and identifying users.
 *
 * @example
 * ```typescript
 * const analytics = new FormoAnalytics("your-write-key");
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
 * ```
 */
export class FormoAnalytics {
  private client: SDKServerSide;

  /**
   * Create a new FormoAnalytics instance
   * @param writeKey - Your Formo project write key
   */
  constructor(writeKey: string) {
    if (!writeKey || typeof writeKey !== "string") {
      throw new Error("writeKey is required and must be a string");
    }

    this.client = new SDKServerSide({
      bearerToken: writeKey,
      environment: "environment_1", // events.formo.so
    });
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
  async track(options: TrackOptions): Promise<void> {
    // Validate inputs before making API call
    validateTrackOptions(options);

    const now = new Date().toISOString();
    // Normalize address to checksummed format (EIP-55)
    const checksumAddress = getChecksumAddress(options.address);

    await this.client.rawEvents.track({
      type: "track",
      channel: "server",
      version: VERSION,
      anonymous_id: options.anonymousId,
      user_id: options.userId ?? null,
      event: options.event,
      properties: options.properties ?? {},
      context: {
        library_name: LIBRARY_NAME,
        library_version: LIBRARY_VERSION,
        ...options.context,
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
  async identify(options: IdentifyOptions): Promise<void> {
    // Validate inputs before making API call
    validateIdentifyOptions(options);

    const now = new Date().toISOString();
    // Normalize address to checksummed format (EIP-55)
    const checksumAddress = getChecksumAddress(options.address);

    await this.client.rawEvents.track({
      type: "identify",
      channel: "server",
      version: VERSION,
      anonymous_id: options.anonymousId,
      user_id: options.userId,
      properties: options.traits ?? {},
      context: {
        library_name: LIBRARY_NAME,
        library_version: LIBRARY_VERSION,
        ...options.context,
      },
      address: checksumAddress,
      original_timestamp: now,
      sent_at: now,
      message_id: randomUUID(),
    });
  }
}
