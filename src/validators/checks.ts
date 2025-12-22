/**
 * Basic type checking utilities
 */

/**
 * Check if value is a string
 */
export const isString = (value: unknown): value is string =>
  typeof value === "string";

/**
 * Check if value is null
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Check if value is undefined
 */
export const isUndefined = (value: unknown): value is undefined =>
  typeof value === "undefined";

/**
 * Check if value is null or undefined
 */
export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  isNull(value) || isUndefined(value);

/**
 * Check if value is defined (not undefined)
 */
export const isDefined = <T>(value: T | undefined): value is T =>
  !isUndefined(value);

/**
 * Check if value is defined and not null
 */
export const isDefinedAndNotNull = <T>(
  value: T | null | undefined
): value is T => !isNullOrUndefined(value);

/**
 * Check if value is a non-empty string (defined, not null, not "")
 */
export const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.length > 0;

/**
 * Check if value is an object (not null, not array)
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Check if value is an array
 */
export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

/**
 * Check if value is a valid UUID
 */
export const isUUID = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
