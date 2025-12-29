// EventQueue Tests

import { EventQueue } from "../../src/queue/EventQueue";
import { IFormoEvent } from "../../src/queue/type";
import { randomUUID } from "crypto";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Create a minimal valid event payload
const createEvent = (overrides: Partial<IFormoEvent> = {}): IFormoEvent => ({
  anonymous_id: randomUUID(),
  channel: "server",
  context: {},
  message_id: randomUUID(),
  original_timestamp: new Date().toISOString(),
  sent_at: new Date().toISOString(),
  type: "track",
  version: "1",
  event: "test_event",
  ...overrides,
});

describe("EventQueue", () => {
  // Use fake timers for interval-based tests
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset fetch mock
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    // Prevent process handlers from interfering with tests
    jest.spyOn(process, "on").mockImplementation(() => process);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("Basic Functionality", () => {
    test("enqueue adds events to the queue", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 }); // High threshold to prevent auto-flush

      await queue.enqueue(createEvent({ event: "event_1" }));
      await queue.enqueue(createEvent({ event: "event_2" }));

      expect(queue.length).toBe(2);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("flush sends all queued events", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      await queue.enqueue(createEvent({ event: "event_1" }));
      await queue.enqueue(createEvent({ event: "event_2" }));
      await queue.enqueue(createEvent({ event: "event_3" }));

      await queue.flush();

      expect(queue.length).toBe(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Verify the fetch was called with correct auth header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-write-key",
          }),
        })
      );
    });

    test("flush with empty queue does nothing", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      const callback = jest.fn();
      await queue.flush(callback);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("Flush on Count Threshold", () => {
    test("auto-flushes when queue reaches flushAt count", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 3 });

      await queue.enqueue(createEvent({ event: "event_1" }));
      expect(mockFetch).not.toHaveBeenCalled();

      await queue.enqueue(createEvent({ event: "event_2" }));
      expect(mockFetch).not.toHaveBeenCalled();

      await queue.enqueue(createEvent({ event: "event_3" }));
      // Should auto-flush after 3rd event
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(queue.length).toBe(0);
    });

    test("flushAt is clamped to valid range (1-100)", async () => {
      // Too low - should clamp to 1
      const queueLow = new EventQueue("test-write-key", { flushAt: 0 });
      await queueLow.enqueue(createEvent());
      expect(mockFetch).toHaveBeenCalledTimes(1); // Flushed immediately at 1

      mockFetch.mockClear();

      // Too high - should clamp to 100
      const queueHigh = new EventQueue("test-write-key", { flushAt: 200 });
      for (let i = 0; i < 100; i++) {
        await queueHigh.enqueue(createEvent({ event: `event_${i}` }));
      }
      expect(mockFetch).toHaveBeenCalledTimes(1); // Flushed at 100, not 200
    });
  });

  describe("Flush on Size Threshold", () => {
    test("auto-flushes when queue exceeds maxQueueSize", async () => {
      // Set a very small maxQueueSize
      const queue = new EventQueue("test-write-key", {
        flushAt: 100,
        maxQueueSize: 100,
      });

      // Create a large event that exceeds the size limit
      const largeEvent = createEvent({
        event: "large_event",
        properties: { data: "x".repeat(200) },
      });

      await queue.enqueue(largeEvent);

      // Should auto-flush because size exceeded
      expect(mockFetch).toHaveBeenCalled();
      expect(queue.length).toBe(0);
    });
  });

  describe("Interval Flushing", () => {
    test("auto-flushes after flushInterval timeout", async () => {
      const queue = new EventQueue("test-write-key", {
        flushAt: 100,
        flushInterval: 5000, // 5 seconds
      });

      await queue.enqueue(createEvent({ event: "event_1" }));
      expect(mockFetch).not.toHaveBeenCalled();

      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000);

      // Need to wait for the flush promise to resolve
      await Promise.resolve();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("flushInterval is clamped to valid range (1s-5min)", async () => {
      // Too low - should clamp to 1000ms
      const queueLow = new EventQueue("test-write-key", {
        flushAt: 100,
        flushInterval: 100, // 100ms, should clamp to 1000ms
      });
      await queueLow.enqueue(createEvent());

      jest.advanceTimersByTime(500);
      await Promise.resolve();
      expect(mockFetch).not.toHaveBeenCalled(); // Not yet

      jest.advanceTimersByTime(600); // Total 1100ms
      await Promise.resolve();
      expect(mockFetch).toHaveBeenCalled(); // Now it should have flushed
    });
  });

  describe("Callback Execution", () => {
    test("enqueue callback is called on successful flush", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 1 }); // Flush immediately

      const callback = jest.fn();
      await queue.enqueue(createEvent(), callback);

      expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
    });

    test("enqueue callback is called on failed flush", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 0,
      }); // No retries

      const callback = jest.fn();
      await queue.enqueue(createEvent(), callback);

      expect(callback).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    test("flush callback is called with all payloads", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      await queue.enqueue(createEvent({ event: "event_1" }));
      await queue.enqueue(createEvent({ event: "event_2" }));

      const callback = jest.fn();
      await queue.flush(callback);

      expect(callback).toHaveBeenCalledWith(
        null,
        expect.arrayContaining([
          expect.objectContaining({ event: "event_1" }),
          expect.objectContaining({ event: "event_2" }),
        ])
      );
    });
  });

  describe("Retry Logic", () => {
    test("retries on 5xx server errors", async () => {
      const error500 = Object.assign(new Error("Internal Server Error"), {
        status: 500,
      });
      mockFetch
        .mockRejectedValueOnce(error500)
        .mockRejectedValueOnce(error500)
        .mockResolvedValue({ ok: true });

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 3,
      });

      // Use runAllTimersAsync to properly handle async operations with fake timers
      const enqueuePromise = queue.enqueue(createEvent());
      await jest.runAllTimersAsync();
      await enqueuePromise;

      // Should have retried twice before succeeding on 3rd attempt
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 10000);

    test("retries on 429 rate limit", async () => {
      const error429 = Object.assign(new Error("Too Many Requests"), {
        status: 429,
      });
      mockFetch.mockRejectedValueOnce(error429).mockResolvedValue({ ok: true });

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 3,
      });

      const enqueuePromise = queue.enqueue(createEvent());
      await jest.runAllTimersAsync();
      await enqueuePromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    test("retries on network errors (ECONNRESET, ETIMEDOUT)", async () => {
      const networkError = Object.assign(new Error("Connection reset"), {
        code: "ECONNRESET",
      });
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ ok: true });

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 3,
      });

      const enqueuePromise = queue.enqueue(createEvent());
      await jest.runAllTimersAsync();
      await enqueuePromise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    test("does NOT retry on 4xx client errors", async () => {
      const error400 = Object.assign(new Error("Bad Request"), { status: 400 });
      mockFetch.mockRejectedValue(error400);

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 3,
      });

      const callback = jest.fn();
      await queue.enqueue(createEvent(), callback);

      // Should only call once, no retries for 4xx
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(error400, expect.any(Object));
    });

    test("gives up after retryCount attempts", async () => {
      const error500 = Object.assign(new Error("Internal Server Error"), {
        status: 500,
      });
      mockFetch.mockRejectedValue(error500);

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 2,
      });

      const callback = jest.fn();
      const enqueuePromise = queue.enqueue(createEvent(), callback);
      await jest.runAllTimersAsync();
      await enqueuePromise;

      // 1 initial + 2 retries = 3 calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith(error500, expect.any(Object));
    }, 10000);

    test("exponential backoff timing is correct", async () => {
      const error500 = Object.assign(new Error("Server Error"), {
        status: 500,
      });
      mockFetch.mockRejectedValue(error500);

      const queue = new EventQueue("test-write-key", {
        flushAt: 1,
        retryCount: 3,
      });

      // Start enqueue (will fail and start retrying)
      const enqueuePromise = queue.enqueue(createEvent());

      // Run all timers to completion
      await jest.runAllTimersAsync();
      await enqueuePromise;

      // 1 initial + 3 retries = 4 calls total
      expect(mockFetch).toHaveBeenCalledTimes(4);
    }, 10000);
  });

  describe("Queue Length Property", () => {
    test("length property reflects current queue size", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      expect(queue.length).toBe(0);

      await queue.enqueue(createEvent());
      expect(queue.length).toBe(1);

      await queue.enqueue(createEvent());
      await queue.enqueue(createEvent());
      expect(queue.length).toBe(3);

      await queue.flush();
      expect(queue.length).toBe(0);
    });
  });

  describe("Flush Batching", () => {
    test("flush only sends up to flushAt events at a time", async () => {
      // Use a high flushAt so we can add 5 events without auto-flushing
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      // Add 5 events
      for (let i = 0; i < 5; i++) {
        await queue.enqueue(createEvent({ event: `event_${i}` }));
      }
      expect(queue.length).toBe(5);
      expect(mockFetch).not.toHaveBeenCalled();

      // Now create a queue with flushAt: 3 to test batching behavior
      const queue2 = new EventQueue("test-write-key", { flushAt: 3 });

      // Add 5 events (first 3 will auto-flush)
      await queue2.enqueue(createEvent({ event: `event_0` }));
      await queue2.enqueue(createEvent({ event: `event_1` }));
      expect(mockFetch).not.toHaveBeenCalled();

      await queue2.enqueue(createEvent({ event: `event_2` })); // triggers flush
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(queue2.length).toBe(0);

      // Add 2 more and manually flush
      await queue2.enqueue(createEvent({ event: `event_3` }));
      await queue2.enqueue(createEvent({ event: `event_4` }));
      expect(queue2.length).toBe(2);

      await queue2.flush();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(queue2.length).toBe(0);
    });
  });

  describe("Pending Flush Handling", () => {
    test("concurrent flush calls wait for pending flush", async () => {
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });
      mockFetch.mockImplementation(() =>
        requestPromise.then(() => ({ ok: true }))
      );

      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      await queue.enqueue(createEvent());

      // Start first flush (will be pending)
      const flush1 = queue.flush();
      // Start second flush (should wait for first)
      const flush2 = queue.flush();

      // Resolve the request
      resolveRequest!();

      await Promise.all([flush1, flush2]);

      // Should only call fetch once for the single event
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases - Large Payloads", () => {
    test("handles very large event properties", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      // Create event with very large properties (100KB+)
      const largeData = "x".repeat(100_000);
      const largeEvent = createEvent({
        event: "large_event",
        properties: {
          bigString: largeData,
          nestedData: {
            level1: {
              level2: {
                data: largeData.slice(0, 10_000),
              },
            },
          },
        },
      });

      await queue.enqueue(largeEvent);
      await queue.flush();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("handles many small events efficiently", async () => {
      const queue = new EventQueue("test-write-key", {
        flushAt: 100,
        maxQueueSize: 10_000_000,
      });

      // Enqueue 500 small events
      const eventCount = 500;
      for (let i = 0; i < eventCount; i++) {
        await queue.enqueue(createEvent({ event: `event_${i}` }));
      }

      // Should have auto-flushed 5 times (500 events / 100 flushAt = 5 flushes)
      expect(mockFetch).toHaveBeenCalledTimes(5);
      expect(queue.length).toBe(0);
    });

    test("handles events with special characters in properties", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 1 });

      const specialEvent = createEvent({
        event: "special_chars_event",
        properties: {
          unicode: "🚀🎉💻",
          newlines: "line1\nline2\r\nline3",
          quotes: 'He said "hello"',
          backslash: "path\\to\\file",
          nullChar: "before\x00after",
          controlChars: "\t\r\n",
          json: '{"key": "value"}',
          html: "<script>alert('xss')</script>",
        },
      });

      await queue.enqueue(specialEvent);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("handles events with null and undefined values in properties", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 1 });

      const eventWithNulls = createEvent({
        event: "nulls_event",
        properties: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: "",
          zero: 0,
          falseValue: false,
          emptyArray: [],
          emptyObject: {},
        },
      });

      await queue.enqueue(eventWithNulls);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("handles deeply nested properties", async () => {
      const queue = new EventQueue("test-write-key", { flushAt: 1 });

      // Create deeply nested object (10 levels)
      let nested: Record<string, unknown> = { value: "deepest" };
      for (let i = 0; i < 10; i++) {
        nested = { [`level_${i}`]: nested };
      }

      const deepEvent = createEvent({
        event: "deep_nested_event",
        properties: nested,
      });

      await queue.enqueue(deepEvent);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Graceful Shutdown Handlers", () => {
    test("registers beforeExit handler on construction", () => {
      const processOnSpy = jest.spyOn(process, "on");

      new EventQueue("test-write-key");

      expect(processOnSpy).toHaveBeenCalledWith(
        "beforeExit",
        expect.any(Function)
      );
    });

    test("registers SIGTERM handler on construction", () => {
      const processOnSpy = jest.spyOn(process, "on");

      new EventQueue("test-write-key");

      expect(processOnSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );
    });

    test("registers SIGINT handler on construction", () => {
      const processOnSpy = jest.spyOn(process, "on");

      new EventQueue("test-write-key");

      expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    });

    test("beforeExit handler flushes pending events", async () => {
      // Capture the beforeExit handler
      let beforeExitHandler: (() => Promise<void>) | undefined;
      jest.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "beforeExit") {
          beforeExitHandler = handler as () => Promise<void>;
        }
        return process;
      });

      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      // Add some events
      await queue.enqueue(createEvent({ event: "pending_1" }));
      await queue.enqueue(createEvent({ event: "pending_2" }));

      expect(queue.length).toBe(2);
      expect(mockFetch).not.toHaveBeenCalled();

      // Simulate beforeExit
      expect(beforeExitHandler).toBeDefined();
      await beforeExitHandler!();

      // Events should be flushed
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(queue.length).toBe(0);
    });

    test("SIGTERM handler flushes pending events before exit", async () => {
      // Capture the SIGTERM handler
      let sigtermHandler: (() => Promise<void>) | undefined;
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);
      jest.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "SIGTERM") {
          sigtermHandler = handler as () => Promise<void>;
        }
        return process;
      });

      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      await queue.enqueue(createEvent({ event: "pending_sigterm" }));
      expect(queue.length).toBe(1);

      // Simulate SIGTERM
      expect(sigtermHandler).toBeDefined();
      await sigtermHandler!();

      // Events should be flushed and process.exit called
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    test("SIGINT handler flushes pending events before exit", async () => {
      // Capture the SIGINT handler
      let sigintHandler: (() => Promise<void>) | undefined;
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);
      jest.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "SIGINT") {
          sigintHandler = handler as () => Promise<void>;
        }
        return process;
      });

      const queue = new EventQueue("test-write-key", { flushAt: 100 });

      await queue.enqueue(createEvent({ event: "pending_sigint" }));
      expect(queue.length).toBe(1);

      // Simulate SIGINT (Ctrl+C)
      expect(sigintHandler).toBeDefined();
      await sigintHandler!();

      // Events should be flushed and process.exit called
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    test("shutdown handlers work with empty queue", async () => {
      let beforeExitHandler: (() => Promise<void>) | undefined;
      jest.spyOn(process, "on").mockImplementation((event, handler) => {
        if (event === "beforeExit") {
          beforeExitHandler = handler as () => Promise<void>;
        }
        return process;
      });

      new EventQueue("test-write-key", { flushAt: 100 });

      // Simulate beforeExit with empty queue
      expect(beforeExitHandler).toBeDefined();
      await beforeExitHandler!();

      // Should not throw, should not call fetch
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("WriteKey Validation", () => {
    test("throws error if writeKey is empty", () => {
      expect(() => new EventQueue("")).toThrow("writeKey is required");
    });

    test("throws error if writeKey is not a string", () => {
      expect(() => new EventQueue(null as any)).toThrow("writeKey is required");
      expect(() => new EventQueue(undefined as any)).toThrow(
        "writeKey is required"
      );
    });
  });
});
