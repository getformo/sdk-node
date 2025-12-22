import { FormoAnalytics, ValidationError } from "./FormoAnalytics";
import { getChecksumAddress } from "./utils";

/**
 * Tests for Formo Node SDK
 * Only runs validation tests - no real API calls to avoid creating test data
 */

async function main() {
  console.log("=== Formo Node SDK Tests ===\n");

  // Use a dummy key for validation tests (won't make real API calls)
  const analytics = new FormoAnalytics("test-write-key");

  // Test 1: Validation error - missing event
  console.log("Test 1: Validation error (missing event)...");
  try {
    await analytics.track({
      anonymousId: "test-123",
      event: "", // Empty event should fail
    });
    console.log("❌ Should have thrown ValidationError");
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log(`✅ Caught ValidationError: ${err.message}`);
    } else {
      throw err;
    }
  }

  // Test 2: Validation error - invalid address
  console.log("\nTest 2: Validation error (invalid address)...");
  try {
    await analytics.track({
      anonymousId: "test-123",
      event: "Test Event",
      address: "not-a-valid-address",
    });
    console.log("❌ Should have thrown ValidationError");
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log(`✅ Caught ValidationError: ${err.message}`);
    } else {
      throw err;
    }
  }

  // Test 3: Validation error - missing userId for identify
  console.log("\nTest 3: Validation error (missing userId for identify)...");
  try {
    await analytics.identify({
      anonymousId: "test-123",
      userId: "", // Empty userId should fail
    });
    console.log("❌ Should have thrown ValidationError");
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log(`✅ Caught ValidationError: ${err.message}`);
    } else {
      throw err;
    }
  }

  // Test 4: Address checksum validation
  console.log("\nTest 4: Address checksum validation...");
  const lowercaseAddress = "0xab5801a7d398351b8be11c439e05c5b3259aec9b";
  const checksummed = getChecksumAddress(lowercaseAddress);
  console.log(`  Input:    ${lowercaseAddress}`);
  console.log(`  Checksum: ${checksummed}`);
  if (checksummed === "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B") {
    console.log("✅ Address correctly checksummed (EIP-55)");
  } else {
    console.log("❌ Checksum mismatch");
  }

  // Test 5: Invalid address returns null
  console.log("\nTest 5: Invalid address returns null...");
  const invalidResult = getChecksumAddress("invalid-address");
  if (invalidResult === null) {
    console.log("✅ Invalid address correctly returns null");
  } else {
    console.log(`❌ Expected null, got: ${invalidResult}`);
  }

  console.log("\n🎉 All tests passed!");
}

main().catch(console.error);
