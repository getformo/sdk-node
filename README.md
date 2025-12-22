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

## Local Testing & Development

To test SDK changes locally before publishing, you can link the SDK to another project.

### Step 1: Link the SDK globally

Clone this repository and link it globally:

```bash
git clone <repo-url>
cd sdk-node
pnpm install
pnpm link --global
```

### Step 2: Add as dependency in your project

In your backend project's `package.json`, add the SDK as a file dependency:

```json
{
  "dependencies": {
    "@formo/analytics-node": "file:/path/to/sdk-node"
  }
}
```

Replace `/path/to/sdk-node` with the absolute path to your cloned SDK directory.

### Step 3: Install dependencies

```bash
cd your-backend-project
pnpm install
```

### Step 4: Test the SDK

1. Create a `.env` file in your project:

```env
FORMO_WRITE_KEY=your-write-key
```

2. Create a test script (e.g., `scripts/test-analytics.ts`) to verify the SDK works correctly:
Below shows a sample test script:

```typescript
/**
 * Analytics SDK Test Script
 *
 * This script tests the @formo/analytics-node SDK by sending a test track event.
 *
 * Usage:
 *   pnpm run script:test-analytics
 *
 * Environment Variables Required:
 *   - FORMO_WRITE_KEY: The write key from formo.so project settings
 *
 * Or pass the write key as an argument:
 *   pnpm run script:test-analytics <writeKey>
 */
import { config } from "dotenv";

// Load environment variables
config();

async function main() {
  console.log("🧪 Testing @formo/analytics-node SDK...\n");

  // Import directly from the linked SDK source
  const { FormoAnalytics } = await import("@formo/analytics-node");

  // Get write key from argument or environment variable
  const args = process.argv.slice(2);
  const writeKey = args[0] || process.env.FORMO_WRITE_KEY;

  if (!writeKey) {
    console.error("❌ Error: No write key provided.");
    console.error(
      "   Please provide a write key as an argument or set FORMO_WRITE_KEY environment variable."
    );
    console.error("\n   Usage: pnpm run script:test-analytics <writeKey>");
    process.exit(1);
  }

  console.log(`Using write key: ${writeKey.substring(0, 8)}...`);

  // Initialize
  const analytics = new FormoAnalytics(writeKey);

  console.log("✅ SDK initialized successfully\n");

  // Send a test track event
  const timestamp = new Date().toISOString();
  console.log("Sending test track event...");

  analytics.track({
    anonymousId: "00000000-0000-0000-0000-000000000000", // or a valid UUID
    event: "SDK Backend Link Test",
    properties: {
      source: "formono-backend",
      timestamp: timestamp,
      testId: `test-${Date.now()}`,
    },
  });

  console.log("   Event queued:", {
    anonymousId: "00000000-0000-0000-0000-000000000000", // or a valid UUID
    event: "SDK Backend Link Test",
    properties: {
      source: "formono-backend",
      timestamp: timestamp,
    },
  });

  // Send a test identify event
  console.log("\nSending test identify event...");

  analytics.identify({
    anonymousId: "00000000-0000-0000-0000-000000000000", // or a valid UUID
    userId: "test-user-backend",
    properties: {
      email: "test@formono-backend.local",
      source: "formono-backend",
      testTimestamp: timestamp,
    },
  });

  console.log("   Identify event queued:", {
    anonymousId: "00000000-0000-0000-0000-000000000000", // or a valid UUID
    userId: "test-user-backend",
    properties: {
      email: "test@formono-backend.local",
      source: "formono-backend",
    },
  });

  // Flush to ensure the event is sent immediately
  console.log("\n🔄 Flushing events...");

  try {
    await analytics.flush();
    console.log("✅ Events flushed successfully!\n");
    console.log("🎉 Test complete!");
    console.log("   ➡️  Check the formo.so Activity page to verify the event");
    console.log("   ➡️  Check Tinybird to confirm data ingestion\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error flushing events:", error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "script:test-analytics": "ts-node ./scripts/test-analytics.ts"
  }
}
```

Run the test:

```bash
# Using .env file
pnpm run script:test-analytics

# Or passing as an argument
pnpm run script:test-analytics <your-write-key>

# Or passing as an environment variable
FORMO_WRITE_KEY=<your-write-key> pnpm run script:test-analytics
```

---

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
