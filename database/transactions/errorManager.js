import { loggerError } from '../../modules/logger.js';
import { BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE } from '../managers/statsBotManager.js';
import { LOGS_LOG_ERROR_TO_DB_INSERT } from '../managers/logsManager.js';

/**
 * Handles errors that occur during command execution.
 * This function logs the error and increments the command execution stats.
 * It is designed to be called when an error is caught in the command execution flow.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {Object} context - The context containing command execution details.
 * @param {UUID} context.guid - The session GUID for the current execution.
 * @param {string} context.commandName - The name of the command that caused the error.
 * @param {string} context.guildId - The ID of the guild where the command was executed.
 * @param {string} context.userId - The ID of the user who executed the command.
 * @param {Error} context.error - The error that occurred during command execution.
 * @returns {DbRunResult} The result of the database operations.
 */
export function handleError(dbInstance, context) {
    const { guid, commandName, guildId, userId, error} = context;

    const transaction = dbInstance.transaction(() => {
        BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE(dbInstance, guid);
        LOGS_LOG_ERROR_TO_DB_INSERT(dbInstance, {
            guid: guid,
            commandName: commandName,
            guildId: guildId,
            userId: userId,
            error: error.message
        });
    });

    try {
        transaction();
    } catch (transactionError) {
        loggerError(`[DB] Failed to handle error: ${transactionError.message}`);
        return { success: false, error: transactionError };
    };
    return { success: true };
};