import { loggerError } from '../../modules/logger.js';
import { GUILD_DATA_NEW_GUILD_INSERT } from '../managers/guildDataManager.js';
import { USER_DATA_NEW_USER_INSERT } from '../managers/userDataManager.js';

/**
 * Inserts a new guild and user into the database.
 * @param {import('better-sqlite3').Database} dbInstance - The database instance.
 * @param {string} guildId - The ID of the guild to insert.
 * @param {string} userId - The ID of the user to insert.
 * @returns {DbRunResult} The result of the database operations.
 */
export function insertNewGuildAndUser(dbInstance, guildId, userId) {
    const transaction = dbInstance.transaction(() => {
        GUILD_DATA_NEW_GUILD_INSERT(dbInstance, guildId);
        USER_DATA_NEW_USER_INSERT(dbInstance, userId, guildId);
    });

    try {
        transaction();
    } catch (error) {
        loggerError(`[DB] Failed to insert new guild and user: ${error.message}`);
        return { success: false, error: error };
    };
    return { success: true };
};