/**
 * Validation functions for FormoAnalytics SDK inputs
 */

import {
  isNonEmptyString,
  isObject,
  isAddress,
  isNullOrUndefined,
  isUUID,
} from "./index";
import type { TrackAPIEvent, IdentifyAPIEvent } from "../types";

// Re-export types for convenience
export type { TrackAPIEvent, IdentifyAPIEvent } from "../types";

/**
 * Custom error class for validation errors
 * Provides clear error messages for invalid inputs
 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly reason: string
  ) {
    super(`Invalid ${field}: ${reason}`);
    this.name = "ValidationError";
  }
}

/**
 * Validates event for track() method
 *
 * @param event - The track event to validate
 * @throws ValidationError if any field is invalid
 *
 * @example
 * validateTrackEvent({
 *   anonymousId: "00000000-0000-0000-0000-000000000000",
 *   event: "Button Clicked",
 *   properties: { buttonId: "cta" }
 * });
 */
export function validateTrackEvent(event: TrackAPIEvent): void {
  // Optional: anonymousId must be a valid UUID if provided
  if (!isNullOrUndefined(event.anonymousId) && !isUUID(event.anonymousId)) {
    throw new ValidationError("anonymousId", "must be a valid UUID");
  }

  // Required: event must be a non-empty string
  if (!isNonEmptyString(event.event)) {
    throw new ValidationError("event", "must be a non-empty string");
  }

  // Optional: userId must be a non-empty string if provided
  if (!isNullOrUndefined(event.userId) && !isNonEmptyString(event.userId)) {
    throw new ValidationError(
      "userId",
      "must be a non-empty string if provided"
    );
  }

  // Optional: properties must be an object if provided
  if (!isNullOrUndefined(event.properties) && !isObject(event.properties)) {
    throw new ValidationError("properties", "must be an object if provided");
  }

  // Optional: context must be an object if provided
  if (!isNullOrUndefined(event.context) && !isObject(event.context)) {
    throw new ValidationError("context", "must be an object if provided");
  }

  // Optional: address must be a valid Ethereum address if provided
  if (!isNullOrUndefined(event.address) && !isAddress(event.address)) {
    throw new ValidationError(
      "address",
      "must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }
}

/**
 * Validates event for identify() method
 *
 * @param event - The identify event to validate
 * @throws ValidationError if any field is invalid
 *
 * @example
 * validateIdentifyEvent({
 *   anonymousId: "00000000-0000-0000-0000-000000000000",
 *   userId: "user-456",
 *   properties: { email: "user@example.com" }
 * });
 */
export function validateIdentifyEvent(event: IdentifyAPIEvent): void {
  // Optional: anonymousId must be a valid UUID if provided
  if (!isNullOrUndefined(event.anonymousId) && !isUUID(event.anonymousId)) {
    throw new ValidationError("anonymousId", "must be a valid UUID");
  }

  // Optional: userId must be a non-empty string if provided
  if (!isNullOrUndefined(event.userId) && !isNonEmptyString(event.userId)) {
    throw new ValidationError(
      "userId",
      "must be a non-empty string if provided"
    );
  }

  // Optional: properties must be an object if provided
  if (!isNullOrUndefined(event.properties) && !isObject(event.properties)) {
    throw new ValidationError("properties", "must be an object if provided");
  }

  // Optional: context must be an object if provided
  if (!isNullOrUndefined(event.context) && !isObject(event.context)) {
    throw new ValidationError("context", "must be an object if provided");
  }

  // Required: address must be a valid Ethereum address
  if (!isAddress(event.address)) {
    throw new ValidationError(
      "address",
      "must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }
}
