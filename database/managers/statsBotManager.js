import { executeRun } from '../dbExecutor.js';
import * as sql from '../sql.js';
import { loggerError } from '../../modules/logger.js';

let BOT_STATS_STARTUP_INSERT_STMT = null;
let BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE_STMT = null;
let BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE_STMT = null;
let BOT_STATS_CREATE_TABLE_STMT = null;

/**
 * Records the GUID and Timestamp of the Bot Session at startup.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {UUID} sessionGuid - The GUID to insert.
 * @param {ISODateTime} startTimeISO - The ISO timestamp of the session start.
 * @param {boolean} debugMode - Whether the bot is running in debug mode.
 * @param {boolean} apiSafe - Whether the bot is running in API-safe mode.
 * @returns {DbRunResult} The result of the insert operation.
 */
function BOT_STATS_STARTUP_INSERT(dbInstance, sessionGuid, startTimeISO, debugMode, apiSafe) {
    if (!BOT_STATS_STARTUP_INSERT_STMT) {
        try {
            BOT_STATS_STARTUP_INSERT_STMT = dbInstance.prepare(sql.STATS_BOT_STARTUP_INSERT);
        } catch (error) {
            loggerError(`[DB] Error preparing BOT_STATS_STARTUP_INSERT statement: ${error.message}`);
            return {success: false, error: error};
        };
    };

    const insertResult = executeRun(BOT_STATS_STARTUP_INSERT_STMT, sessionGuid, startTimeISO, debugMode?1:0, apiSafe?1:0)
    if (!insertResult.success) {
        loggerError(`[DB] Failed to create bot stats record for session ${sessionGuid}.`);
    };

    return insertResult;
};

/**
 * Increments the number of commands ran for a given GUID.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {UUID} sessionGuid - The GUID of the bot session.
 * @return {DbRunResult} The result of the update operation.
 */
function BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE(dbInstance, sessionGuid) {
    if (!sessionGuid) {
        console.warn('[DB] Attempted to increment commands_ran without a session GUID.');
        return {success: false, error: new Error('Session GUID is required for incrementing commands_ran.')};
    }
    
    if (!BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE_STMT) {
        try {
            BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE_STMT = dbInstance.prepare(sql.STATS_BOT_INCREMENT_COMMANDS_RAN_UPDATE);
        } catch (error) {
            loggerError(`[DB] Error preparing BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE statement: ${error.message}`);
            return {success: false, error: error};
        }
    };

    const updateResult = executeRun(BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE_STMT, sessionGuid);
    if (!updateResult.success) {
        loggerError(`[DB] Failed to increment commands_ran for session ${sessionGuid}.`);
    };

    return updateResult;
};

/**
 * Increments the number of errors logged for a given GUID.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {UUID} sessionGuid - The GUID of the bot session.
 * @return {DbRunResult} The result of the update operation.
 */
function BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE(dbInstance, sessionGuid) {
    if (!sessionGuid) {
        console.warn('[DB] Attempted to increment errors_logged without a session GUID.');
        return {success: false, error: new Error('Session GUID is required for incrementing errors_logged.')};
    }
    
    if (!BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE_STMT) {
        try {
            BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE_STMT = dbInstance.prepare(sql.STATS_BOT_INCREMENT_ERRORS_LOGGED_UPDATE);
        } catch (error) {
            loggerError(`[DB] Error preparing BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE statement: ${error.message}`);
            return {success: false, error: error};
        }
    };

    const updateResult = executeRun(BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE_STMT, sessionGuid);
    if (!updateResult.success) {
        loggerError(`[DB] Failed to increment errors_logged for session ${sessionGuid}.`);
    };

    return updateResult;
};

/**
 * Updates the bot_stats table with shutdown information.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {UUID} sessionGuid - The GUID of the bot session.
 * @param {number} exitCode - The exit code of the bot.
 * @param {string} exitMessage - The exit message of the bot.
 * @returns {DbRunResult} The result of the update operation.
 */
function BOT_STATS_SHUTDOWN_UPDATE(dbInstance, sessionGuid, exitCode, exitMessage) {
    if (!sessionGuid) {
        console.warn('[DB] Attempted to update shutdown without a session GUID.');
        return {success: false, error: new Error('Session GUID is required for shutdown update.')};
    }

    const shutdownStmt = dbInstance.prepare(sql.STATS_BOT_SHUTDOWN_UPDATE);
    const shutdownResult = executeRun(shutdownStmt, exitCode, exitMessage, sessionGuid);
    if (!shutdownResult.success) {
        loggerError(`[DB] Failed to update shutdown for session ${sessionGuid}.`);
    }

    return shutdownResult;
};

/**
 * Intializes the bot_stats tables if it does not exist.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @returns {DbRunResult} The result of the table creation operation.
 */
function BOT_STATS_CREATE_TABLE(dbInstance) {
    if (!BOT_STATS_CREATE_TABLE_STMT) {
        try {
            BOT_STATS_CREATE_TABLE_STMT = dbInstance.prepare(sql.STATS_BOT_CREATE_TABLE);
        } catch (error) {
            loggerError(`[DB] Error preparing BOT_STATS_CREATE_TABLE statement: ${error.message}`);
            return {success: false, error: error};
        }
    };

    const createResult = executeRun(BOT_STATS_CREATE_TABLE_STMT);
    if (!createResult.success) {
        loggerError('[DB] Failed to create bot_stats table.');
    }

    return createResult;
};

export {
    BOT_STATS_STARTUP_INSERT,
    BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE,
    BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE,
    BOT_STATS_SHUTDOWN_UPDATE,
    BOT_STATS_CREATE_TABLE
};