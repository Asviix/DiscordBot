import { loggerError } from '../../modules/logger.js';
import { GUILD_DATA_COMMANDS_RAN_INCREMENT } from '../managers/guildDataManager.js';
import { USER_DATA_COMMANDS_RAN_INCREMENT } from '../managers/userDataManager.js';
import { STATS_COMMANDS_INCREMENT_EXECUTION_COUNT } from '../managers/statsCommandsManager.js';
import { BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE } from '../managers/statsBotManager.js';

/**
 * Increments the execution count stats for a command.
 * This function updates the stats for the bot, command, guild, and user.
 * It is designed to be called after a command is successfully executed.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {Object} context - The context containing command execution details.
 * @param {UUID} context.guid - The session GUID for the current execution.
 * @param {string} context.commandName - The name of the command executed.
 * @param {string} context.guildId - The ID of the guild where the command was executed.
 * @param {string} context.userId - The ID of the user who executed the command.
 * @returns {DbRunResult} The result of the database operations.
 */
export function incrementExecutionCountStats(dbInstance, context) {
    const { guid, commandName, guildId, userId } = context;

    const transaction = dbInstance.transaction(() => {
        BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE(dbInstance, guid);
        STATS_COMMANDS_INCREMENT_EXECUTION_COUNT(dbInstance, commandName);
        GUILD_DATA_COMMANDS_RAN_INCREMENT(dbInstance, guildId);
        USER_DATA_COMMANDS_RAN_INCREMENT(dbInstance, userId, guildId);
    });

    try {
        transaction();
    } catch (error) {
        loggerError(`[DB] Failed to increment execution count stats: ${error.message}`);
        return { success: false, error: error };
    }
    return { success: true };
};