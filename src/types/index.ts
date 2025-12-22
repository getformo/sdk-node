// Type definitions for Formo Node SDK

export type Nullable<T> = T | null;

// Ethereum wallet address (hex string with 0x prefix)
export type Address = string;

export type EventProperties = Record<string, unknown>;
export type EventContext = Record<string, unknown>;

export type UserTraits = Record<string, unknown>;

export interface TrackOptions {
  // Required. 
  anonymousId: string; // Device/session identifier for anonymous tracking
  event: string; // Name of the event being tracked

  // Optional
  userId?: string;
  properties?: EventProperties; // custom properties
  context?: EventContext; // contextual information
  address?: Address; // Ethereum wallet address (validated and checksummed)
}

export interface IdentifyOptions {
  // Required. 
  anonymousId: string; // Device/session identifier for anonymous tracking
  userId: string; // Your application's user identifier

  // Optional
  traits?: UserTraits; // User traits/properties
  address?: Address; // Ethereum wallet address (validated and checksummed)
  context?: EventContext; // contextual information
}
