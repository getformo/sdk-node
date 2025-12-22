// Property normalization utilities
// Matches web SDK: sdk/src/lib/event/EventFactory.ts generateTrackEvent

import type { EventProperties } from "../types";

/**
 * Normalize track event properties to match web SDK behavior
 * - revenue: convert to number
 * - currency: convert to lowercase string (default: "usd")
 * - points: convert to number
 * - volume: convert to number
 */
export function normalizeTrackProperties(
  properties: EventProperties | undefined
): EventProperties {
  if (!properties) return {};

  const normalized = { ...properties };

  // Normalize revenue and currency
  if (normalized.revenue !== undefined) {
    normalized.revenue = Number(normalized.revenue);
    normalized.currency = (
      typeof normalized.currency === "string" ? normalized.currency : "usd"
    ).toLowerCase();
  }

  // Normalize points
  if (normalized.points !== undefined) {
    normalized.points = Number(normalized.points);
  }

  // Normalize volume
  if (normalized.volume !== undefined) {
    normalized.volume = Number(normalized.volume);
  }

  return normalized;
}
