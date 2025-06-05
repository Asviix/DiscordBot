const logger = require('./modules/logger.js');

let guildDataStmts = {
    insert: null,
    select: null
};

let userDataStmts = {
    insert: null,
    select: null
};

let createBotStatsStmt = null;

let incrementCommandsRanStmt = null;

let incrementErrorsLoggedStmt = null;

let logErrorToDBStmt = null;

const SQL_ENSURE_GUILD_DATA_INSERT = `INSERT OR IGNORE INTO guild_data (guild_id) VALUES (?)`;
const SQL_ENSURE_GUILD_DATA_SELECT = `SELECT * FROM guild_data WHERE guild_id = ?`;
const SQL_ENSURE_USER_DATA_INSERT = `
        INSERT OR IGNORE INTO user_data (user_id, guild_id) 
        VALUES (?, ?)
    `;
const SQL_ENSURE_USER_DATA_SELECT = `SELECT * FROM user_data WHERE user_id = ? AND guild_id = ?`;
const SQL_CREATE_BOT_STATS_INSERT = `
        INSERT OR IGNORE INTO bot_stats (session_guid, start_time, debug_mode, api_safe, commands_ran, errors_logged) 
        VALUES (?, ?, ?, ?, 0, 0) 
    `;
const SQL_INCREMENT_COMMANDS_RAN_UPDATE = `
        UPDATE bot_stats 
        SET commands_ran = commands_ran + 1 
        WHERE session_guid = ?
    `;
const SQL_INCREMENT_ERRORS_LOGGED_UPDATE = `
        UPDATE bot_stats 
        SET errors_logged = errors_logged + 1 
        WHERE session_guid = ?
    `;
const SQL_LOG_ERROR_TO_DB = `
        INSERT INTO logs (session_guid, guild_id, user_id, command, error_message, stack_trace)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

/**
 * Ensures a record for the guild exists in guild_data.
 * If not, creates one with default settings.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} guildId - The ID of the guild.
 * @returns {object | null} The guild's settings object.
 */
function ensureGuildData(dbInstance, guildId) {
    if (!guildDataStmts.insert) {
        guildDataStmts.insert = dbInstance.prepare(SQL_ENSURE_GUILD_DATA_INSERT)
    };
    if (!guildDataStmts.select) {
        guildDataStmts.select = dbInstance.prepare(SQL_ENSURE_GUILD_DATA_SELECT)
    };
    
    const insertResult = executeRun(guildDataStmts.insert, guildId);
    if (!insertResult.success) {
        logger.loggerError(`[DB] Failed to ensure guild data (insert step) for guild ${guildId}.`);
        return null; // Or handle error appropriately
    }

    const selectResult = executeGet(guildDataStmts.select, guildId);
    if (!selectResult.success) {
        logger.loggerError(`[DB] Failed to ensure guild data (select step) for guild ${guildId}.`);
        return null;
    }
    return selectResult.data;
};

/**
 * Ensures a record for the user in a specific guild exists in user_data.
 * If not, creates one with default data.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} userId - The ID of the user.
 * @param {string} guildId - The ID of the guild.
 * @returns {object | null} The user's data object for that guild.
 */
function ensureUserData(dbInstance, userId, guildId) {
    if (!userDataStmts.insert) {
        userDataStmts.insert = dbInstance.prepare(SQL_ENSURE_USER_DATA_INSERT)
    };
    if (!userDataStmts.select) {
        userDataStmts.select = dbInstance.prepare(SQL_ENSURE_USER_DATA_SELECT)
    };

    const insertResult = executeRun(userDataStmts.insert, userId, guildId);
    if (!insertResult.success) {
        logger.loggerError(`[DB] Failed to ensure user data (insert step) for user ${userId} in guild ${guildId}.`);
        return null; // Or handle error appropriately
    };

    const selectResult = executeGet(userDataStmts.select, userId, guildId);
    if (!selectResult.success) {
        logger.loggerError(`[DB] Failed to ensure user data (select step) for user ${userId} in guild ${guildId}.`);
        return null;
    };
    return selectResult.data;
};

/**
 * Ensures a record for the bot's timestamp exists in bot_stats.
 * If not, creates one.
 * @param {Date} date - The current Date (ISO8601)
 */
function createBotStats(dbInstance, sessionGuid, startTimeISO, debugMode, apiSafe) {
    if (!createBotStatsStmt) {
        createBotStatsStmt = dbInstance.prepare(SQL_CREATE_BOT_STATS_INSERT);
    };

    const insertResult = executeRun(createBotStatsStmt, sessionGuid, startTimeISO, debugMode, apiSafe)
    if (!insertResult.success) {
        logger.loggerError(`[DB] Failed to create bot stats record for session ${sessionGuid}.`);
    };
};

/**
 * Increments the commands_ran counter for the given session GUID.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} sessionGuid - The GUID of the current bot session.
 */
function incrementCommandsRan(dbInstance, sessionGuid) {
    if (!sessionGuid) {
        console.warn('[DB] Attempted to increment commands_ran without a session GUID.');
        return;
    }
    
    if (!incrementCommandsRanStmt) {
        incrementCommandsRanStmt = dbInstance.prepare(SQL_INCREMENT_COMMANDS_RAN_UPDATE);
    };

    const updateResult = executeRun(incrementCommandsRanStmt, sessionGuid);
    if (!updateResult.success) {
        logger.loggerError(`[DB] Failed to increment commands_ran for session ${sessionGuid}.`);
    };
};

/**
 * Increments the errors_logged counter for the given session GUID.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} sessionGuid - The GUID of the current bot session.
 */
function incrementErrorsLogged(dbInstance, sessionGuid) {
    if (!sessionGuid) {
        console.warn('[DB] Attempted to increment errors_logged without a session GUID.');
        return;
    }
    
    if (!incrementErrorsLoggedStmt) {
        incrementErrorsLoggedStmt = dbInstance.prepare(SQL_INCREMENT_ERRORS_LOGGED_UPDATE);
    };

    const updateResult = executeRun(incrementErrorsLoggedStmt, sessionGuid);
    if (!updateResult.success) {
        logger.loggerError(`[DB] Failed to increment errors_logged for session ${sessionGuid}.`);
    };
};

/**
 * Logs an error to the logs table.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} sessionGuid - The GUID of the current bot session.
 * @param {Error} errorObject - The error object that was caught.
 * @param {object} [context={}] - Optional context about the error.
 * @param {string} [context.guildId] - The guild ID where the error occurred.
 * @param {string} [context.userId] - The user ID who triggered the error.
 * @param {string} [context.commandName] - The name of the command being executed.
 */
function logErrorToDB(dbInstance, sessionGuid, errorObject, context = {}) {
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

    if (!logErrorToDBStmt) { // Assuming logsStmts caching pattern
        logErrorToDBStmt = dbInstance.prepare(SQL_LOG_ERROR_TO_DB);
    };
    
    // The timestamp column in 'logs' table uses DEFAULT CURRENT_TIMESTAMP
    const result = executeRun(
        logErrorToDBStmt,
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
};

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
        logger.loggerError(`[DB EXECUTE RUN ERROR] Statement: ${statement.source}`, error); 
        // logger.loggerError(`SQLite Error executing statement: ${statement.source}`, error);
        return { success: false, error: error };
    }
}

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
        logger.loggerError(`[DB EXECUTE GET ERROR] Statement: ${statement.source}`, error);
        // logger.loggerError(`SQLite Error executing query (get): ${statement.source}`, error);
        return { success: false, error: error, data: undefined };
    }
}

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
        logger.loggerError(`[DB EXECUTE ALL ERROR] Statement: ${statement.source}`, error);
        // logger.loggerError(`SQLite Error executing query (all): ${statement.source}`, error);
        return { success: false, error: error, data: [] };
    }
}

module.exports = {
    ensureGuildData,
    ensureUserData,
    createBotStats,
    incrementCommandsRan,
    incrementErrorsLogged,
    logErrorToDB
};