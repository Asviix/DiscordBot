const { executeRun } = require('../dbExecutor.js');
const { UUID } = require('../types.js');
const sql = require('../sql.js');
const logger = require('../../modules/logger.js');

let LOGS_LOG_ERROR_TO_DB_INSERT_STMT = null;
let LOGS_CREATE_TABLE_STMT = null;

/**
 * Logs an error to the logs table.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {UUID} sessionGuid - The GUID of the current bot session.
 * @param {Error} errorObject - The error object that was caught.
 * @param {object} [context={}] - Optional context about the error.
 * @param {string} [context.guildId] - The guild ID where the error occurred.
 * @param {string} [context.userId] - The user ID who triggered the error.
 * @param {string} [context.commandName] - The name of the command being executed.
 * @return {DbRunResult} The result of the insert operation.
 */
function LOGS_LOG_ERROR_TO_DB_INSERT(dbInstance, sessionGuid, errorObject, context = {}) {
    const { guildId, userId, commandName } = context;

    let detailedErrorMessage = errorObject.message || 'Unknown error';

    // Attempt to get more specific messages if it's a combined error
    if (errorObject.errors && Array.isArray(errorObject.errors) && errorObject.message === 'Received one or more errors') {
        const specificMessages = [];
        errorObject.errors.forEach(nestedErrorArray => {
            if (Array.isArray(nestedErrorArray) && nestedErrorArray.length === 2) {
                const propertyName = nestedErrorArray[0];
                const actualError = nestedErrorArray[1];
                if (actualError.errors && Array.isArray(actualError.errors)) {
                    actualError.errors.forEach(subError => {
                        specificMessages.push(`[${propertyName}]: ${subError.message || String(subError)} (Given: "${subError.given}")`);
                    });
                } else {
                    specificMessages.push(`[${propertyName}]: ${actualError.message || String(actualError)}`);
                }
            } else {
                specificMessages.push(String(nestedErrorArray.message || nestedErrorArray));
            };
        });
        if (specificMessages.length > 0) {
            detailedErrorMessage = `Main: ${errorObject.message} | Specifics: ${specificMessages.join('; ')}`;
        };
    };

    const stackTrace = errorObject.stack || null;

    if (!LOGS_LOG_ERROR_TO_DB_INSERT_STMT) {
        try {
            LOGS_LOG_ERROR_TO_DB_INSERT_STMT = dbInstance.prepare(sql.LOGS_LOG_ERROR_TO_DB);
        } catch (error) {
            logger.loggerError(`[DB] Error preparing LOGS_LOG_ERROR_TO_DB_INSERT_STMT statement: ${error.message}`);
            return { success: false, error: error };
        };
    };
    
    // The timestamp column in 'logs' table uses DEFAULT CURRENT_TIMESTAMP
    const result = executeRun(
        LOGS_LOG_ERROR_TO_DB_INSERT_STMT,
        sessionGuid,
        guildId || null,
        userId || null,
        commandName || null,
        detailedErrorMessage.substring(0, 2000), // Truncate if necessary for DB column size
        stackTrace ? stackTrace.substring(0, 4000) : null // Truncate if necessary
    );

    if (!result.success) {
        logger.loggerError(`[CRITICAL FALLBACK] Failed to log an error to DB. Original error message: ${detailedErrorMessage}`);
    };

    return result;
};

/**
 * Creates the logs table if it doesn't exist.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @returns {DbRunResult} The result of the table creation operation.
 */
function LOGS_CREATE_TABLE(dbInstance) {
    if (!LOGS_CREATE_TABLE_STMT) {
        try {
            LOGS_CREATE_TABLE_STMT = dbInstance.prepare(sql.LOGS_CREATE_TABLE);
        } catch (error) {
            logger.loggerError(`[DB] Error preparing LOGS_CREATE_TABLE_STMT statement: ${error.message}`);
            return { success: false, error: error };
        };
    };

    const createResult = executeRun(LOGS_CREATE_TABLE_STMT);
    if (!createResult.success) {
        logger.loggerError('[DB] Failed to create logs table.');
    };

    return createResult;
};

module.exports = {
    LOGS_LOG_ERROR_TO_DB_INSERT,
    LOGS_CREATE_TABLE
};