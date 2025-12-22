/**
 * Validation functions for FormoAnalytics SDK inputs
 */

import {
  isNonEmptyString,
  isObject,
  isAddress,
  isNullOrUndefined,
} from "./index";
import type { TrackOptions, IdentifyOptions } from "../types";

// Re-export types for convenience
export type { TrackOptions, IdentifyOptions } from "../types";

/**
 * Custom error class for validation errors
 * Provides clear error messages for invalid inputs
 */
export class ValidationError extends Error {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`Invalid ${field}: ${reason}`);
    this.name = "ValidationError";
  }
}

/**
 * Validates options for track() method
 *
 * @param options - The track options to validate
 * @throws ValidationError if any field is invalid
 *
 * @example
 * validateTrackOptions({
 *   anonymousId: "device-123",
 *   event: "Button Clicked",
 *   properties: { buttonId: "cta" }
 * });
 */
export function validateTrackOptions(options: TrackOptions): void {
  // Required: anonymousId must be a non-empty string
  if (!isNonEmptyString(options.anonymousId)) {
    throw new ValidationError("anonymousId", "must be a non-empty string");
  }

  // Required: event must be a non-empty string
  if (!isNonEmptyString(options.event)) {
    throw new ValidationError("event", "must be a non-empty string");
  }

  // Optional: userId must be a non-empty string if provided
  if (!isNullOrUndefined(options.userId) && !isNonEmptyString(options.userId)) {
    throw new ValidationError(
      "userId",
      "must be a non-empty string if provided"
    );
  }

  // Optional: properties must be an object if provided
  if (!isNullOrUndefined(options.properties) && !isObject(options.properties)) {
    throw new ValidationError("properties", "must be an object if provided");
  }

  // Optional: context must be an object if provided
  if (!isNullOrUndefined(options.context) && !isObject(options.context)) {
    throw new ValidationError("context", "must be an object if provided");
  }

  // Optional: address must be a valid Ethereum address if provided
  if (!isNullOrUndefined(options.address) && !isAddress(options.address)) {
    throw new ValidationError(
      "address",
      "must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }
}

/**
 * Validates options for identify() method
 *
 * @param options - The identify options to validate
 * @throws ValidationError if any field is invalid
 *
 * @example
 * validateIdentifyOptions({
 *   anonymousId: "device-123",
 *   userId: "user-456",
 *   traits: { email: "user@example.com" }
 * });
 */
export function validateIdentifyOptions(options: IdentifyOptions): void {
  // Required: anonymousId must be a non-empty string
  if (!isNonEmptyString(options.anonymousId)) {
    throw new ValidationError("anonymousId", "must be a non-empty string");
  }

  // Required: userId must be a non-empty string
  if (!isNonEmptyString(options.userId)) {
    throw new ValidationError("userId", "must be a non-empty string");
  }

  // Optional: traits must be an object if provided
  if (!isNullOrUndefined(options.traits) && !isObject(options.traits)) {
    throw new ValidationError("traits", "must be an object if provided");
  }

  // Optional: context must be an object if provided
  if (!isNullOrUndefined(options.context) && !isObject(options.context)) {
    throw new ValidationError("context", "must be an object if provided");
  }

  // Optional: address must be a valid Ethereum address if provided
  if (!isNullOrUndefined(options.address) && !isAddress(options.address)) {
    throw new ValidationError(
      "address",
      "must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }
}
