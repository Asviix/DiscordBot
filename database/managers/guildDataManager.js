const { executeRun } = require('../dbExecutor.js');
const sql = require('../sql.js');
const logger = require('../../modules/logger.js');

let GUILD_DATA_NEW_GUILD_INSERT_STMT = null;
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
            logger.loggerError(`[DB] Error preparing GUILD_DATA_NEW_GUILD_INSERT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };
    
    const insertResult = executeRun(GUILD_DATA_NEW_GUILD_INSERT_STMT, guildId);
    if (!insertResult.success) {
        logger.loggerError(`[DB] Failed to ensure guild data (insert step) for guild ${guildId}.`);
    };

    return insertResult;
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
            logger.loggerError(`[DB] Error preparing GUILD_DATA_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const createResult = executeRun(GUILD_DATA_CREATE_TABLE_STMT);
    if (!createResult.success) {
        logger.loggerError('[DB] Failed to create guild_data table.');
    };

    return createResult;
};

module.exports = {
    GUILD_DATA_NEW_GUILD_INSERT,
    GUILD_DATA_CREATE_TABLE
};