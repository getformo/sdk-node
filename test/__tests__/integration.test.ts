/**
 * Integration Tests for Formo Node SDK
 *
 * These tests make REAL API calls to the Formo API.
 * They require a valid FORMO_WRITE_KEY environment variable.
 *
 * Run with: npm run test:integration
 *
 * NOTE: These tests are skipped by default to avoid:
 * - Creating test data in production
 * - Requiring API keys in CI
 * - Slow test runs during development
 */

import { FormoAnalytics, ValidationError } from "../../src/FormoAnalytics";

// Test ID prefix for identifying test data
const TEST_PREFIX = "TEST_SDK_NODE";
const TEST_ID = "00000000-0000-0000-0000-000000000000";

// Skip all integration tests by default
// Change to `describe` to run, or use: FORMO_WRITE_KEY=xxx pnpm run test:integration
const integrationDescribe =
  process.env.FORMO_WRITE_KEY && process.env.RUN_INTEGRATION_TESTS
    ? describe
    : describe.skip;

// Get write key from environment
const getWriteKey = (): string => {
  const key = process.env.FORMO_WRITE_KEY;
  if (!key) {
    throw new Error(
      "FORMO_WRITE_KEY environment variable is required for integration tests"
    );
  }
  return key;
};

integrationDescribe("FormoAnalytics Integration Tests", () => {
  let analytics: FormoAnalytics;

  beforeAll(() => {
    analytics = new FormoAnalytics(getWriteKey(), {
      flushAt: 10, // Batch events to reduce API calls
      retryCount: 2,
    });
  });

  afterAll(async () => {
    // Ensure all events are flushed before tests complete
    await analytics.flush();
  });

  // Combined test: sending 1 track and 1 identify = 2 events total
  test("track and identify with all features", async () => {
    // Track with all optional fields
    await expect(
      analytics.track({
        anonymousId: TEST_ID,
        event: `${TEST_PREFIX} - Integration Test - Track`,
        userId: `${TEST_PREFIX}-user`,
        address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", // Vitalik's address
        properties: {
          testId: TEST_ID,
          revenue: 99.99,
          currency: "USD",
          nested: { level1: { level2: "value" } },
        },
        context: {
          userAgent: "Integration Test",
        },
      })
    ).resolves.toBeUndefined();

    // Identify with all optional fields
    await expect(
      analytics.identify({
        anonymousId: TEST_ID,
        userId: `${TEST_PREFIX}-user`,
        address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", // lowercase
        properties: {
          email: "test@example.com",
          plan: "test",
          createdAt: new Date().toISOString(),
        },
      })
    ).resolves.toBeUndefined();
  });

  // Validation tests (0 events sent, only local validation)
  describe("Validation (local only)", () => {
    test("rejects invalid inputs", async () => {
      // Invalid anonymousId
      await expect(
        analytics.track({
          anonymousId: "not-a-uuid",
          event: "Test Event",
        })
      ).rejects.toThrow(ValidationError);

      // Empty event name
      await expect(
        analytics.track({
          anonymousId: TEST_ID,
          event: "", // Invalid
        })
      ).rejects.toThrow(ValidationError);

      // Invalid address
      await expect(
        analytics.track({
          anonymousId: TEST_ID,
          event: "Test Event",
          address: "not-a-valid-address", // Invalid
        })
      ).rejects.toThrow(ValidationError);

      // Missing address for identify
      await expect(
        analytics.identify({
          anonymousId: TEST_ID,
          userId: `${TEST_PREFIX}-user`,
        } as any) // Missing required address
      ).rejects.toThrow(ValidationError);
    });

    test("auto-generates anonymousId locally", async () => {
      // This technically queues 1 event but we won't wait for flush unless we force it
      // The test is just checking the promise resolution
      await expect(
        analytics.track({
          event: `${TEST_PREFIX} - Integration Test - Auto ID`,
        })
      ).resolves.toBeUndefined();
    });
  });

  // Batching test (sends 1 batch of 3 events = 3 events total)
  test("batching and flush", async () => {
    const batchedAnalytics = new FormoAnalytics(getWriteKey(), {
      flushAt: 10,
      flushInterval: 60000,
    });

    // Queue 3 events
    for (let i = 0; i < 3; i++) {
      await batchedAnalytics.track({
        anonymousId: TEST_ID,
        event: `${TEST_PREFIX} - Integration Test - Batch`,
        properties: { index: i },
      });
    }

    // Manually flush - this should send all events in one batch
    await expect(batchedAnalytics.flush()).resolves.toBeUndefined();
  });
});

// Standalone manual test (can be run directly with ts-node)
if (require.main === module) {
  (async () => {
    console.log("Running manual integration test...\n");

    const writeKey = process.env.FORMO_WRITE_KEY;
    if (!writeKey) {
      console.error("Error: FORMO_WRITE_KEY environment variable is required");
      console.log(
        "Usage: FORMO_WRITE_KEY=your-key npx ts-node src/__tests__/integration.test.ts"
      );
      process.exit(1);
    }

    const manualAnalytics = new FormoAnalytics(writeKey, { flushAt: 1 });

    try {
      console.log("1. Tracking event...");
      await manualAnalytics.track({
        anonymousId: TEST_ID,
        event: `${TEST_PREFIX} - Manual Integration Test`,
        properties: {
          testId: TEST_ID,
          runAt: new Date().toISOString(),
        },
      });
      console.log("   ✅ Track event sent successfully");

      console.log("\n2. Identifying user...");
      await manualAnalytics.identify({
        address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        anonymousId: TEST_ID,
        userId: `${TEST_PREFIX}-manual-test-user`,
        properties: {
          source: "manual-test",
        },
      });
      console.log("   ✅ Identify event sent successfully");

      console.log("\n3. Flushing...");
      await manualAnalytics.flush();
      console.log("   ✅ Flush completed");

      console.log("\n🎉 All manual integration tests passed!");
    } catch (error) {
      console.error("\n❌ Test failed:", error);
      process.exit(1);
    }
  })();
}
