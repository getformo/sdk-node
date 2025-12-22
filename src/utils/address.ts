/**
 * Address utilities for Ethereum address validation and checksumming
 */

import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { isAddress } from "../validators";

/**
 * Convert a Uint8Array to a hex string
 */
function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return (
    "0x" +
    Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Converts an Ethereum address to its checksummed format (EIP-55)
 *
 * The checksum is encoded in the capitalization of the hex characters.
 * This provides error detection for mistyped addresses.
 *
 * @param address - The Ethereum address to checksum (with or without 0x prefix)
 * @returns The checksummed address
 * @throws Error if the address format is invalid
 *
 * @example
 * toChecksumAddress("0xab5801a7d398351b8be11c439e05c5b3259aec9b")
 * // Returns: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
 */
export function toChecksumAddress(address: string): string {
  if (!isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }

  const lowerCaseAddress = address.toLowerCase().replace(/^0x/i, "");
  const hash = uint8ArrayToHexString(keccak256(utf8ToBytes(lowerCaseAddress)));

  // EIP-1052: empty data check
  if (
    hash === null || hash ===
    "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
  ) {
    return "";
  }

  let checksumAddress = "0x";
  const addressHash = hash.replace(/^0x/i, "");

  for (let i = 0; i < lowerCaseAddress.length; i++) {
    // If ith character of hash is 8-f, make address character uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += lowerCaseAddress[i].toUpperCase();
    } else {
      checksumAddress += lowerCaseAddress[i];
    }
  }

  return checksumAddress;
}

/**
 * Validates and returns a checksummed address, or null if invalid
 *
 * @param address - The address to validate and checksum
 * @returns The checksummed address, or null if invalid
 *
 * @example
 * getChecksumAddress("0xab5801a7d398351b8be11c439e05c5b3259aec9b")
 * // Returns: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
 *
 * getChecksumAddress("invalid")
 * // Returns: null
 */
export function getChecksumAddress(
  address: string | null | undefined
): string | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  const trimmed = address.trim();
  if (!isAddress(trimmed)) {
    return null;
  }

  try {
    return toChecksumAddress(trimmed);
  } catch {
    return null;
  }
}
