import { loggerError } from '../modules/logger.js';

/**
 * Executes a prepared statement that doesn't return rows (INSERT, UPDATE, DELETE).
 * @param {import('better-sqlite3').Statement} statement - The pre-prepared statement.
 * @param  {...any} params - Parameters to bind to the statement.
 * @returns {{ success: boolean, error?: Error, info?: import('better-sqlite3').RunResult }}
 */
function executeRun(statement, ...params) {
    try {
        const info = statement.run(...params);
        return { success: true, info: info }; // 'info' contains 'changes' and 'lastInsertRowid'
    } catch (error) {
        // Use your logger here
        loggerError(`[DB EXECUTE RUN ERROR] Statement: ${statement.source}`, error); 
        // logger.loggerError(`SQLite Error executing statement: ${statement.source}`, error);
        return { success: false, error: error };
    };
};

/**
 * Executes a prepared statement that returns a single row (SELECT ... LIMIT 1).
 * @param {import('better-sqlite3').Statement} statement - The pre-prepared statement.
 * @param  {...any} params - Parameters to bind to the statement.
 * @returns {{ success: boolean, data?: any, error?: Error }}
 */
function executeGet(statement, ...params) {
    try {
        const row = statement.get(...params);
        return { success: true, data: row };
    } catch (error) {
        loggerError(`[DB EXECUTE GET ERROR] Statement: ${statement.source}`, error);
        // logger.loggerError(`SQLite Error executing query (get): ${statement.source}`, error);
        return { success: false, error: error, data: undefined };
    };
};

/**
 * Executes a prepared statement that returns multiple rows (SELECT).
 * @param {import('better-sqlite3').Statement} statement - The pre-prepared statement.
 * @param  {...any} params - Parameters to bind to the statement.
 * @returns {{ success: boolean, data?: any[], error?: Error }}
 */
function executeAll(statement, ...params) {
    try {
        const rows = statement.all(...params);
        return { success: true, data: rows };
    } catch (error) {
        loggerError(`[DB EXECUTE ALL ERROR] Statement: ${statement.source}`, error);
        // logger.loggerError(`SQLite Error executing query (all): ${statement.source}`, error);
        return { success: false, error: error, data: [] };
    };
};

export {
    executeRun,
    executeGet,
    executeAll
};