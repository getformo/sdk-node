// Type definitions for Formo Node SDK

export type Nullable<T> = T | null;

// Ethereum wallet address (hex string with 0x prefix)
export type Address = string;

export type IFormoEventProperties = Record<string, unknown>;
export type IFormoEventContext = Record<string, unknown>;

export interface TrackAPIEvent {
  // Required.
  event: string; // Name of the event being tracked

  // Optional
  anonymousId?: string; // Device/session identifier for anonymous tracking
  userId?: string;
  properties?: IFormoEventProperties; // custom properties
  context?: IFormoEventContext; // contextual information
  address?: Address; // Ethereum wallet address (validated and checksummed)
}

export interface IdentifyAPIEvent {
  // Required.
  userId: string; // Your application's user identifier

  // Optional
  anonymousId?: string; // Device/session identifier for anonymous tracking
  properties?: IFormoEventProperties; // User properties
  address?: Address; // Ethereum wallet address (validated and checksummed)
  context?: IFormoEventContext; // contextual information
}

// SDK configuration options
export interface AnalyticsOptions {
  flushAt?: number; // Flush when queue has N events (default: 20)
  flushInterval?: number; // Flush every N ms (default: 30000)
  maxQueueSize?: number; // Flush when queue > N bytes (default: 500KB)
  retryCount?: number; // Retry failed requests N times (default: 3)
}

// ============================================
// Internal Types (for EventQueue)
// ============================================

export type EventChannel = "web" | "mobile" | "server";

export type EventType =
  | "identify"
  | "track";
  // | "page"
  // | "connect"
  // | "disconnect"
  // | "detect"
  // | "chain"
  // | "signature"
  // | "transaction";

/**
 * Contextual information about the event
 */
export interface EventContext {
  library_name?: string;
  library_version?: string;
  // Additional context fields can be added
  [key: string]: unknown;
}

/**
 * Internal event payload sent to the API
 */
export interface IFormoEvent {
  anonymous_id: string;
  channel: EventChannel;
  context: EventContext;
  message_id: string;
  original_timestamp: string;
  sent_at: string;
  type: EventType;
  version: string;
  address?: string | null;
  event?: string;
  properties?: IFormoEventProperties;
  user_id?: string | null;
}

/**
 * API response from raw_events endpoint
 */
export interface FormoEventResponse {
  quarantined_rows?: number;
  successful_rows?: number;
}
