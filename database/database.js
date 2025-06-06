import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import Database from 'better-sqlite3';
import { BOT_STATS_CREATE_TABLE, BOT_STATS_STARTUP_INSERT } from './managers/statsBotManager.js';
import { STATS_COMMANDS_CREATE_TABLE } from './managers/statsCommandsManager.js';
import { GUILD_DATA_CREATE_TABLE } from './managers/guildDataManager.js';
import { USER_DATA_CREATE_TABLE } from './managers/userDataManager.js';
import { LOGS_CREATE_TABLE } from './managers/logsManager.js';
import { randomUUID } from 'node:crypto';
import { loggerDebug, loggerLog } from '../modules/logger.js';
import { config } from '../config.js';

const dbFilePath = resolve(import.meta.dirname, 'data', 'database.sqlite');

const dataDir = dirname(dbFilePath);
if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
};

const db = new Database(dbFilePath, { verbose: loggerDebug });

function initializeDatabase() {
    loggerLog('Initializing database...');

	BOT_STATS_CREATE_TABLE(db);
	STATS_COMMANDS_CREATE_TABLE(db);
	GUILD_DATA_CREATE_TABLE(db);
	USER_DATA_CREATE_TABLE(db);
	LOGS_CREATE_TABLE(db);

    loggerLog('Database initialized.');
};

initializeDatabase();

const currentSessionGUID = randomUUID();
const currentSessionStartTimeISO = new Date().toISOString();
BOT_STATS_STARTUP_INSERT(db, currentSessionGUID, currentSessionStartTimeISO, config.debugMode, config.apiSafe);

export {
	db,
	currentSessionGUID,
	currentSessionStartTimeISO
};