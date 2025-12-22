/**
 * Ethereum address validation utilities
 * Adapted from web SDK: sdk/src/validators/address.ts
 *
 * Note: This is a simplified version without checksum validation
 * to avoid heavy crypto dependencies. For server-side use cases,
 * basic format validation is usually sufficient.
 */

import { isString } from "./checks";

/**
 * Regex pattern for validating Ethereum addresses
 * Matches: 0x followed by 40 hex characters (case insensitive)
 */
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

/**
 * Check if a value is a valid Ethereum address format
 *
 * @param value - The value to validate
 * @returns true if valid Ethereum address format
 *
 * @example
 * isAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f3b4B3") // true
 * isAddress("0xinvalid") // false
 * isAddress("not-an-address") // false
 */
export const isAddress = (value: unknown): boolean => {
  if (!isString(value)) {
    return false;
  }
  return ETH_ADDRESS_REGEX.test(value);
};

/**
 * Normalize an address to lowercase with 0x prefix
 * Returns null if the address is invalid
 *
 * @param value - The address to normalize
 * @returns Normalized address or null if invalid
 */
export const normalizeAddress = (value: string): string | null => {
  if (!isAddress(value)) {
    return null;
  }
  return value.toLowerCase();
};
