const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const statsBotManager = require('./managers/statsBotManager.js');
const statsCommandsManager = require('./managers/statsCommandsManager.js');
const guildDataManager = require('./managers/guildDataManager.js');
const userDataManager = require('./managers/userDataManager.js');
const logsManager = require('./managers/logsManager.js');
const crypto = require('node:crypto');
const logger = require('../modules/logger.js');
const config = require('../config.js');

const dbFilePath = path.resolve(__dirname, 'data', 'database.sqlite');

const dataDir = path.dirname(dbFilePath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
};

const db = new Database(dbFilePath, { verbose: logger.loggerDebug });

function initializeDatabase() {
    logger.loggerLog('Initializing database...');

	statsBotManager.BOT_STATS_CREATE_TABLE(db);
	statsCommandsManager.STATS_COMMANDS_CREATE_TABLE(db);
	guildDataManager.GUILD_DATA_CREATE_TABLE(db);
	userDataManager.USER_DATA_CREATE_TABLE(db);
	logsManager.LOGS_CREATE_TABLE(db);

    logger.loggerLog('Database initialized.');
};

initializeDatabase();

const currentSessionGUID = crypto.randomUUID();
const currentSessionStartTimeISO = new Date().toISOString();
statsBotManager.BOT_STATS_STARTUP_INSERT(db, currentSessionGUID, currentSessionStartTimeISO, config.debugMode, config.apiSafe);

module.exports = {
	db,
	currentSessionGUID,
	currentSessionStartTimeISO,
};