import { executeRun } from '../dbExecutor.js';
import * as sql from '../sql.js';
import { loggerError } from '../../modules/logger.js';

let GUILD_DATA_NEW_GUILD_INSERT_STMT = null;
let GUILD_DATA_COMMANDS_RAN_INCREMENT_STMT = null;
let GUILD_DATA_CREATE_TABLE_STMT = null;

/**
 * Ensures a record for the guild exists in guild_data.
 * If not, creates one with default settings.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} guildId - The ID of the guild.
 * @returns {DbRunResult} The result of the insert operation.
 */
function GUILD_DATA_NEW_GUILD_INSERT(dbInstance, guildId) {
    if (!GUILD_DATA_NEW_GUILD_INSERT_STMT) {
        try {
            GUILD_DATA_NEW_GUILD_INSERT_STMT = dbInstance.prepare(sql.GUILD_DATA_NEW_GUILD_INSERT);
        } catch (error) {
            loggerError(`[DB] Error preparing GUILD_DATA_NEW_GUILD_INSERT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };
    
    const insertResult = executeRun(GUILD_DATA_NEW_GUILD_INSERT_STMT, guildId);
    if (!insertResult.success) {
        loggerError(`[DB] Failed to ensure guild data (insert step) for guild ${guildId}.`);
    };

    return insertResult;
};

/**
 * Increments the commands_ran count for a guild.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} guildId - The ID of the guild.
 * @returns {DbRunResult} The result of the update operation.
 */
function GUILD_DATA_COMMANDS_RAN_INCREMENT(dbInstance, guildId) {
    if (!GUILD_DATA_COMMANDS_RAN_INCREMENT_STMT) {
        try {
            GUILD_DATA_COMMANDS_RAN_INCREMENT_STMT = dbInstance.prepare(sql.GUILD_DATA_COMMANDS_RAN_INCREMENT);
        } catch (error) {
            loggerError(`[DB] Error preparing GUILD_DATA_COMMANDS_RAN_INCREMENT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };
    const params = [guildId];
    const updateResult = executeRun(GUILD_DATA_COMMANDS_RAN_INCREMENT_STMT, params);
    if (!updateResult.success) {
        loggerError(`[DB] Failed to increment commands_ran for guild ${guildId}.`);
    };

    return updateResult;
};

/**
 * Creates the guild_data table if it doesn't exist.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @returns {DbRunResult} The result of the table creation operation.
 */
function GUILD_DATA_CREATE_TABLE(dbInstance) {
    if (!GUILD_DATA_CREATE_TABLE_STMT) {
        try {
            GUILD_DATA_CREATE_TABLE_STMT = dbInstance.prepare(sql.GUILD_DATA_CREATE_TABLE);
        } catch (error) {
            loggerError(`[DB] Error preparing GUILD_DATA_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const createResult = executeRun(GUILD_DATA_CREATE_TABLE_STMT);
    if (!createResult.success) {
        loggerError('[DB] Failed to create guild_data table.');
    };

    return createResult;
};

export {
    GUILD_DATA_NEW_GUILD_INSERT,
    GUILD_DATA_COMMANDS_RAN_INCREMENT,
    GUILD_DATA_CREATE_TABLE
};