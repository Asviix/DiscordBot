import { executeRun } from '../dbExecutor.js';
import * as sql from '../sql.js';
import { loggerError } from '../../modules/logger.js';

let STATS_COMMANDS_CREATE_TABLE_STMT = null;
let STATS_COMMANDS_INCREMENT_EXECUTION_COUNT_STMT = null;

/** * Increments the execution count of a command and updates the last executed timestamp.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} commandName - The name of the command to update.
 * @returns {DbRunResult} The result of the update operation.
 */
function STATS_COMMANDS_INCREMENT_EXECUTION_COUNT(dbInstance, commandName) {
    if (!STATS_COMMANDS_INCREMENT_EXECUTION_COUNT_STMT) {
        try {
            STATS_COMMANDS_INCREMENT_EXECUTION_COUNT_STMT = dbInstance.prepare(sql.STATS_COMMANDS_INCREMENT_EXECUTION_COUNT);
        } catch (error) {
            loggerError(`[DB] Error preparing STATS_COMMANDS_INCREMENT_EXECUTION_COUNT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        };
    };

    const params = [commandName];
    const updateResult = executeRun(STATS_COMMANDS_INCREMENT_EXECUTION_COUNT_STMT, params);
    if (!updateResult.success) {
        loggerError(`[DB] Failed to increment execution count for command: ${commandName}`);
    };

    return updateResult;
};

/** * Creates the stats_commands table if it doesn't exist.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @returns {DbRunResult} The result of the table creation operation.
 */
function STATS_COMMANDS_CREATE_TABLE(dbInstance) {
    if (!STATS_COMMANDS_CREATE_TABLE_STMT) {
        try {
            STATS_COMMANDS_CREATE_TABLE_STMT = dbInstance.prepare(sql.STATS_COMMANDS_CREATE_TABLE);
        } catch (error) {
            loggerError(`[DB] Error preparing STATS_COMMANDS_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const createResult = executeRun(STATS_COMMANDS_CREATE_TABLE_STMT);
    if (!createResult.success) {
        loggerError('[DB] Failed to create stats_commands table.');
    };

    return createResult;
};

export {
    STATS_COMMANDS_INCREMENT_EXECUTION_COUNT,
    STATS_COMMANDS_CREATE_TABLE
};