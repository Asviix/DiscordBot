import { executeRun } from '../dbExecutor.js';
import * as sql from '../sql.js';
import { loggerError } from '../../modules/logger.js';

let USER_DATA_NEW_USER_INSERT_STMT = null;
let USER_DATA_COMMANDS_RAN_INCREMENT_STMT = null;
let USER_DATA_CREATE_TABLE_STMT = null;

/** * Ensures a record for the user in a specific guild exists in user_data.
 * If not, creates one with default data.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} userId - The ID of the user.
 * @param {string} guildId - The ID of the guild.
 * @returns {DbRunResult} The result of the insert operation.
 */
function USER_DATA_NEW_USER_INSERT(dbInstance, userId, guildId) {
    if (!USER_DATA_NEW_USER_INSERT_STMT) {
        try {
            USER_DATA_NEW_USER_INSERT_STMT = dbInstance.prepare(sql.USER_DATA_NEW_USER_INSERT);
        } catch (error) {
            loggerError(`[DB] Error preparing USER_DATA_NEW_USER_INSERT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const insertResult = executeRun(USER_DATA_NEW_USER_INSERT_STMT, userId, guildId);
    if (!insertResult.success) {
        loggerError(`[DB] Failed to ensure user data (insert step) for user ${userId} in guild ${guildId}.`);
    };

    return insertResult;
};

/**
 * Increments the commands_ran count for a user in a specific guild.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} userId - The ID of the user.
 * @param {string} guildId - The ID of the guild.
 * @returns {DbRunResult} The result of the update operation.
 */
function USER_DATA_COMMANDS_RAN_INCREMENT(dbInstance, userId, guildId) {
    if (!USER_DATA_COMMANDS_RAN_INCREMENT_STMT) {
        try {
            USER_DATA_COMMANDS_RAN_INCREMENT_STMT = dbInstance.prepare(sql.USER_DATA_COMMANDS_RAN_INCREMENT);
        } catch (error) {
            loggerError(`[DB] Error preparing USER_DATA_COMMANDS_RAN_INCREMENT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };
    const params = [userId, guildId];
    const updateResult = executeRun(USER_DATA_COMMANDS_RAN_INCREMENT_STMT, params);
    if (!updateResult.success) {
        loggerError(`[DB] Failed to increment commands_ran for user ${userId} in guild ${guildId}.`);
    };

    return updateResult;
};

/**
 * Creates the user_data table if it doesn't exist.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @returns {DbRunResult} The result of the table creation operation.
 */
function USER_DATA_CREATE_TABLE(dbInstance) {
    if (!USER_DATA_CREATE_TABLE_STMT) {
        try {
            USER_DATA_CREATE_TABLE_STMT = dbInstance.prepare(sql.USER_DATA_CREATE_TABLE);
        } catch (error) {
            loggerError(`[DB] Error preparing USER_DATA_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const createResult = executeRun(USER_DATA_CREATE_TABLE_STMT);
    if (!createResult.success) {
        loggerError('[DB] Failed to create user_data table.');
    };

    return createResult;
};

export {
    USER_DATA_NEW_USER_INSERT,
    USER_DATA_COMMANDS_RAN_INCREMENT,
    USER_DATA_CREATE_TABLE
};