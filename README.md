# Formo Node SDK

Server-side Node.js SDK for [Formo Analytics](https://formo.so).

## Installation

```bash
npm install @formo/analytics-node
# or
pnpm add @formo/analytics-node
```

## Quick Start

```typescript
import { FormoAnalytics } from "@formo/analytics-node";

const analytics = new FormoAnalytics("your-write-key");

// Track an event
await analytics.track({
  anonymousId: "device-uuid",
  event: "Purchase Completed",
  properties: {
    orderId: "123",
    total: 99.99,
    currency: "USD",
  },
});

// Identify a user
await analytics.identify({
  anonymousId: "device-uuid",
  userId: "user-123",
  traits: {
    email: "user@example.com",
    plan: "premium",
  },
});

// Flush pending events before shutdown
await analytics.flush();
```

## API Reference

### `new FormoAnalytics(writeKey, options?)`

Create a new analytics instance.

| Option          | Type     | Default  | Description                      |
| --------------- | -------- | -------- | -------------------------------- |
| `flushAt`       | `number` | `20`     | Flush when N events are queued   |
| `flushInterval` | `number` | `30000`  | Flush every N milliseconds       |
| `maxQueueSize`  | `number` | `500000` | Flush when queue exceeds N bytes |
| `retryCount`    | `number` | `3`      | Retry failed requests N times    |

```typescript
const analytics = new FormoAnalytics("your-write-key", {
  flushAt: 10,
  flushInterval: 10000,
});
```

### `analytics.track(event)`

Track a custom event.

```typescript
await analytics.track({
  // Required
  anonymousId: "device-uuid", // Device/session identifier
  event: "Button Clicked", // Event name

  // Optional
  userId: "user-123", // Your user identifier
  properties: {}, // Event properties
  address: "0x...", // Ethereum wallet address
  context: {}, // Additional context
});
```

### `analytics.identify(event)`

Identify a user and their traits.

```typescript
await analytics.identify({
  // Required
  anonymousId: "device-uuid", // Device/session identifier
  userId: "user-123", // Your user identifier

  // Optional
  traits: {}, // User properties
  address: "0x...", // Ethereum wallet address
  context: {}, // Additional context
});
```

### `analytics.flush()`

Manually flush all pending events.

```typescript
// Call before process exit to ensure all events are sent
await analytics.flush();
```

## Ethereum Address Handling

The SDK automatically validates and checksums Ethereum addresses using EIP-55:

```typescript
await analytics.track({
  anonymousId: "device-uuid",
  event: "Wallet Connected",
  address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", // lowercase
  // Stored as: 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B (checksummed)
});
```

Invalid addresses will throw a `ValidationError`.

## Error Handling

```typescript
import { FormoAnalytics, ValidationError } from "@formo/analytics-node";

try {
  await analytics.track({
    anonymousId: "",
    event: "Test",
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed: ${error.field} - ${error.reason}`);
  }
}
```

## Graceful Shutdown

The SDK automatically registers handlers for `SIGTERM`, `SIGINT`, and `beforeExit` to flush pending events before process termination.

For manual control:

```typescript
process.on("SIGTERM", async () => {
  await analytics.flush();
  process.exit(0);
});
```

## Development

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests (requires API key)
FORMO_WRITE_KEY=your-key pnpm run test:integration
```

### Project Structure

```
sdk-node/
├── src/
│   ├── FormoAnalytics.ts   # Main SDK class
│   ├── queue/              # Event batching and retry logic
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Address checksumming, property normalization
│   └── validators/         # Input validation
├── sdks/
│   └── sdk-server-side-typescript/  # Generated API client (Stainless)
└── package.json
```