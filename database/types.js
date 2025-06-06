/**
 * A string representing a universal unique identifier (UUID).
 * @typedef {string} UUID
 * @example
 * "123e4567-e89b-12d3-a456-426614174000"
 */

/**
 * A string formatted as an ISO 8601 date-time string.
 * @typedef {string} ISODateTime
 * @example
 * "2023-10-01T12:00:00Z"
 */

/**
 * A standard result object for database execution functions that don't return data rows.
 * @typedef {object} DbRunResult
 * @property {boolean} success - Whether the execution was successful.
 * @property {Error} [error] - The error object if execution failed.
 * @property {import('better-sqlite3').RunResult} [info] - The result info from a successful .run() execution.
 */

/**
 * A standard result object for database functions that return a single row of data.
 * @typedef {object} DbGetResult
 * @property {boolean} success
 * @property {any} [data] - The data row returned by the operation, if applicable.
 * @property {Error} [error]
 */