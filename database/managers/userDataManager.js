const { executeRun } = require('../dbExecutor.js');
const sql = require('../sql.js');
const logger = require('../../modules/logger.js');

let USER_DATA_NEW_USER_INSERT_STMT = null;
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
            logger.loggerError(`[DB] Error preparing USER_DATA_NEW_USER_INSERT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const insertResult = executeRun(USER_DATA_NEW_USER_INSERT_STMT, userId, guildId);
    if (!insertResult.success) {
        logger.loggerError(`[DB] Failed to ensure user data (insert step) for user ${userId} in guild ${guildId}.`);
    };

    return insertResult;
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
            logger.loggerError(`[DB] Error preparing USER_DATA_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        }
    };

    const createResult = executeRun(USER_DATA_CREATE_TABLE_STMT);
    if (!createResult.success) {
        logger.loggerError('[DB] Failed to create user_data table.');
    };

    return createResult;
};

module.exports = {
    USER_DATA_NEW_USER_INSERT,
    USER_DATA_CREATE_TABLE
};