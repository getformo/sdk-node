// Event queue for batching and sending events

import { SDKServerSide } from "../../sdks/sdk-server-side-typescript";
import { IFormoEvent, IEventQueue } from "./type";

type Callback = (...args: unknown[]) => void;

interface QueueItem {
  payload: IFormoEvent;
  callback: Callback;
}

export interface QueueOptions {
  flushAt?: number; // Flush when queue has N events
  flushInterval?: number; // Flush every N ms
  maxQueueSize?: number; // Flush when queue > N bytes
  retryCount?: number; // Retry failed requests N times
}

// Constants with defaults
const DEFAULT_FLUSH_AT = 20;
const MAX_FLUSH_AT = 100;
const MIN_FLUSH_AT = 1;

const DEFAULT_FLUSH_INTERVAL = 30_000; // 30 seconds
const MAX_FLUSH_INTERVAL = 300_000; // 5 minutes
const MIN_FLUSH_INTERVAL = 1_000; // 1 second

const DEFAULT_MAX_QUEUE_SIZE = 500_000; // 500KB
const DEFAULT_RETRY_COUNT = 3;

const noop = () => {};

// Clamp a number between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class EventQueue implements IEventQueue {
  private client: SDKServerSide;
  private queue: QueueItem[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingFlush: Promise<void> | null = null;

  private flushAt: number;
  private flushInterval: number;
  private maxQueueSize: number;
  private retryCount: number;

  constructor(client: SDKServerSide, options: QueueOptions = {}) {
    this.client = client;
    this.flushAt = clamp(
      options.flushAt ?? DEFAULT_FLUSH_AT,
      MIN_FLUSH_AT,
      MAX_FLUSH_AT
    );
    this.flushInterval = clamp(
      options.flushInterval ?? DEFAULT_FLUSH_INTERVAL,
      MIN_FLUSH_INTERVAL,
      MAX_FLUSH_INTERVAL
    );
    this.maxQueueSize = options.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE;
    this.retryCount = options.retryCount ?? DEFAULT_RETRY_COUNT;

    // Setup process exit handlers for graceful shutdown
    this.setupProcessHandlers();
  }

  // Add event to queue
  async enqueue(
    payload: IFormoEvent,
    callback: Callback = noop
  ): Promise<void> {
    this.queue.push({ payload, callback });

    // Check if we should flush
    const hasReachedCount = this.queue.length >= this.flushAt;
    const hasReachedSize = this.getQueueSize() >= this.maxQueueSize;

    if (hasReachedCount || hasReachedSize) {
      await this.flush();
      return;
    }

    // Start interval timer if not already running
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  // Flush all pending events
  async flush(callback: Callback = noop): Promise<void> {
    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Nothing to flush
    if (this.queue.length === 0) {
      callback();
      return;
    }

    // Wait for pending flush
    if (this.pendingFlush) {
      await this.pendingFlush;
    }

    // Take items from queue
    const items = this.queue.splice(0, this.flushAt);
    const payloads = items.map((item) => item.payload);

    // Send batch
    this.pendingFlush = this.sendBatch(payloads)
      .then(() => {
        items.forEach((item) => item.callback(null, item.payload));
        callback(null, payloads);
      })
      .catch((err) => {
        items.forEach((item) => item.callback(err, item.payload));
        callback(err, payloads);
      })
      .finally(() => {
        this.pendingFlush = null;
        // If there are more items, schedule next flush
        if (this.queue.length > 0 && !this.timer) {
          this.timer = setTimeout(() => this.flush(), this.flushInterval);
        }
      });

    await this.pendingFlush;
  }

  // Send batch with retry logic
  private async sendBatch(payloads: IFormoEvent[]): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        // Send each event through the Stainless client
        for (const payload of payloads) {
          await this.client.rawEvents.track(payload);
        }
        return; // Success
      } catch (err) {
        lastError = err as Error;

        // Check if error is retryable
        if (!this.isRetryable(err) || attempt === this.retryCount) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s, ...
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  // Check if error should be retried
  private isRetryable(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const err = error as { status?: number; code?: string };

    // Retry on 5xx server errors
    if (err.status && err.status >= 500 && err.status <= 599) return true;

    // Retry on rate limit
    if (err.status === 429) return true;

    // Retry on network errors
    if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") return true;

    return false;
  }

  // Get current queue size in bytes
  private getQueueSize(): number {
    return this.queue.reduce(
      (acc, item) => acc + JSON.stringify(item.payload).length,
      0
    );
  }

  // Sleep helper
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Setup Node.js process handlers for graceful shutdown
  private setupProcessHandlers(): void {
    const handleExit = async () => {
      await this.flush();
    };

    // Flush on process exit
    process.on("beforeExit", handleExit);

    // Handle SIGTERM (container shutdown, etc.)
    process.on("SIGTERM", async () => {
      await this.flush();
      process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", async () => {
      await this.flush();
      process.exit(0);
    });
  }

  // Get queue length (for testing/debugging)
  get length(): number {
    return this.queue.length;
  }
}
