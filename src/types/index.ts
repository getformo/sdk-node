// Type definitions for Formo Node SDK

export type Nullable<T> = T | null;

// Ethereum wallet address (hex string with 0x prefix)
export type Address = string;

export type EventProperties = Record<string, unknown>;
export type EventContext = Record<string, unknown>;

export type UserTraits = Record<string, unknown>;

export interface TrackAPIEvent {
  // Required.
  anonymousId: string; // Device/session identifier for anonymous tracking
  event: string; // Name of the event being tracked

  // Optional
  userId?: string;
  properties?: EventProperties; // custom properties
  context?: EventContext; // contextual information
  address?: Address; // Ethereum wallet address (validated and checksummed)
}

export interface IdentifyAPIEvent {
  // Required.
  anonymousId: string; // Device/session identifier for anonymous tracking
  userId: string; // Your application's user identifier

  // Optional
  traits?: UserTraits; // User traits/properties
  address?: Address; // Ethereum wallet address (validated and checksummed)
  context?: EventContext; // contextual information
}

// SDK configuration options
export interface AnalyticsOptions {
  flushAt?: number; // Flush when queue has N events (default: 20)
  flushInterval?: number; // Flush every N ms (default: 30000)
  maxQueueSize?: number; // Flush when queue > N bytes (default: 500KB)
  retryCount?: number; // Retry failed requests N times (default: 3)
}
