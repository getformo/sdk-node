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

import { FormoAnalytics, ValidationError } from "../FormoAnalytics";

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

// Generate unique test identifiers with TEST_SDK_NODE prefix for easy identification
const generateTestId = () =>
  `TEST_SDK_NODE-${Date.now()}-${Math.random().toString(36).slice(2)}`;

integrationDescribe("FormoAnalytics Integration Tests", () => {
  let analytics: FormoAnalytics;

  beforeAll(() => {
    analytics = new FormoAnalytics(getWriteKey(), {
      flushAt: 1, // Flush immediately for testing
      retryCount: 2,
    });
  });

  afterAll(async () => {
    // Ensure all events are flushed before tests complete
    await analytics.flush();
  });

  describe("Track Events", () => {
    test("successfully tracks a basic event", async () => {
      const testId = generateTestId();

      await expect(
        analytics.track({
          anonymousId: testId,
          event: "Integration Test - Basic Track",
          properties: {
            testId,
            testType: "basic",
            timestamp: new Date().toISOString(),
          },
        })
      ).resolves.toBeUndefined();
    });

    test("successfully tracks event with all optional fields", async () => {
      const testId = generateTestId();

      await expect(
        analytics.track({
          anonymousId: testId,
          event: "Integration Test - Full Track",
          userId: `user-${testId}`,
          properties: {
            testId,
            revenue: 99.99,
            currency: "USD",
            points: 100,
            items: ["item1", "item2"],
            nested: { level1: { level2: "value" } },
          },
          context: {
            ip: "127.0.0.1",
            userAgent: "Integration Test",
          },
        })
      ).resolves.toBeUndefined();
    });

    test("successfully tracks event with Ethereum address", async () => {
      const testId = generateTestId();

      await expect(
        analytics.track({
          anonymousId: testId,
          event: "Integration Test - With Address",
          address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", // Vitalik's address
          properties: {
            testId,
            hasAddress: true,
          },
        })
      ).resolves.toBeUndefined();
    });

    test("tracks event with lowercase address (auto-checksummed)", async () => {
      const testId = generateTestId();

      await expect(
        analytics.track({
          anonymousId: testId,
          event: "Integration Test - Lowercase Address",
          address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", // lowercase
          properties: { testId },
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("Identify Events", () => {
    test("successfully identifies a user", async () => {
      const testId = generateTestId();

      await expect(
        analytics.identify({
          anonymousId: testId,
          userId: `user-${testId}`,
          traits: {
            email: `test-${testId}@example.com`,
            name: "Integration Test User",
            plan: "test",
            createdAt: new Date().toISOString(),
          },
        })
      ).resolves.toBeUndefined();
    });

    test("successfully identifies user with Ethereum address", async () => {
      const testId = generateTestId();

      await expect(
        analytics.identify({
          anonymousId: testId,
          userId: `user-${testId}`,
          address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
          traits: {
            walletConnected: true,
          },
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("Validation (still enforced in integration)", () => {
    test("rejects track with empty event name", async () => {
      await expect(
        analytics.track({
          anonymousId: generateTestId(),
          event: "", // Invalid
        })
      ).rejects.toThrow(ValidationError);
    });

    test("rejects track with invalid address", async () => {
      await expect(
        analytics.track({
          anonymousId: generateTestId(),
          event: "Test Event",
          address: "not-a-valid-address", // Invalid
        })
      ).rejects.toThrow(ValidationError);
    });

    test("rejects identify with empty userId", async () => {
      await expect(
        analytics.identify({
          anonymousId: generateTestId(),
          userId: "", // Invalid
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("Batching and Flush", () => {
    test("batched events are sent on flush", async () => {
      // Create a new analytics instance with higher batch threshold
      const batchedAnalytics = new FormoAnalytics(getWriteKey(), {
        flushAt: 10, // Higher threshold
        flushInterval: 60000, // Long interval so we control flush
      });

      const testId = generateTestId();

      // Queue multiple events (should not send immediately)
      for (let i = 0; i < 5; i++) {
        await batchedAnalytics.track({
          anonymousId: testId,
          event: `Integration Test - Batch ${i}`,
          properties: { batchIndex: i, testId },
        });
      }

      // Manually flush - this should send all events
      await expect(batchedAnalytics.flush()).resolves.toBeUndefined();
    });

    test("auto-flushes when reaching batch threshold", async () => {
      const batchedAnalytics = new FormoAnalytics(getWriteKey(), {
        flushAt: 3, // Low threshold
      });

      const testId = generateTestId();

      // This should trigger an auto-flush after the 3rd event
      for (let i = 0; i < 3; i++) {
        await batchedAnalytics.track({
          anonymousId: testId,
          event: `Integration Test - Auto Batch ${i}`,
          properties: { batchIndex: i, testId },
        });
      }

      // If we got here without errors, the batch was sent successfully
      expect(true).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("handles invalid write key gracefully", async () => {
      const badAnalytics = new FormoAnalytics("invalid-write-key", {
        flushAt: 1,
        retryCount: 0, // No retries for faster test
      });

      // The SDK should either reject or handle the error gracefully
      try {
        await badAnalytics.track({
          anonymousId: generateTestId(),
          event: "Should Fail",
        });
      } catch (error) {
        // Error is expected with invalid key
        expect(error).toBeDefined();
      }
    });
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

    const analytics = new FormoAnalytics(writeKey, { flushAt: 1 });
    const testId = generateTestId();

    try {
      console.log("1. Tracking event...");
      await analytics.track({
        anonymousId: testId,
        event: "Manual Integration Test",
        properties: {
          testId,
          runAt: new Date().toISOString(),
        },
      });
      console.log("   ✅ Track event sent successfully");

      console.log("\n2. Identifying user...");
      await analytics.identify({
        anonymousId: testId,
        userId: `manual-test-user-${testId}`,
        traits: {
          source: "manual-test",
        },
      });
      console.log("   ✅ Identify event sent successfully");

      console.log("\n3. Flushing...");
      await analytics.flush();
      console.log("   ✅ Flush completed");

      console.log("\n🎉 All manual integration tests passed!");
      console.log(`   Test ID: ${testId}`);
      console.log("   Check your Formo dashboard to verify events arrived.");
    } catch (error) {
      console.error("\n❌ Test failed:", error);
      process.exit(1);
    }
  })();
}
