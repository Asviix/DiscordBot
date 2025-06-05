const fs = require('node:fs');
const path = require('node:path');
const Discord = require('discord.js');
const config = require('./config.js');
const logger = require('./modules/logger.js');
const Database = require('better-sqlite3');
const dbUtils = require('./dbUtils.js');
const crypto = require('node:crypto');

logger.loggerDebug('Debug Mode is Enabled!');

const dbFilePath = path.resolve(__dirname, 'data', 'databse.sqlite');

const dataDir = path.dirname(dbFilePath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
};

const db = new Database(dbFilePath, { verbose: logger.loggerDebug });

function initializeDatabase() {
    logger.loggerLog('Initializing database...');

    const createUserDataTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
		PRIMARY KEY (user_id, guild_id)
        );
		
    `);
    createUserDataTable.run();

    const createGuildDataTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS guild_data (
        guild_id TEXT PRIMARY KEY
        );
    `);
    createGuildDataTable.run();

	const createBotStatsDataTable = db.prepare(`
		CREATE TABLE IF NOT EXISTS bot_stats (
		session_guid TEXT NOT NULL PRIMARY KEY,
		start_time TEXT NOT NULL,
		debug_mode INTEGER NOT NULL,
		api_safe INTEGER NOT NULL,
		commands_ran INTEGER NOT NULL DEFAULT 0,
		errors_logged INTEGER NOT NULL DEFAULT 0
		);
	`);
	createBotStatsDataTable.run();

	const createLogsDataTable = db.prepare(`
		CREATE TABLE IF NOT EXISTS logs (
		error_id INTEGER PRIMARY KEY AUTOINCREMENT,
		session_guid TEXT NOT NULL,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		guild_id TEXT,
		user_id TEXT,
		command TEXT,
		error_message TEXT NOT NULL,
		stack_trace TEXT
		)
	`);
	createLogsDataTable.run();

    logger.loggerLog('Database initialized.');
};

initializeDatabase();

const currentSessionGUID = crypto.randomUUID();
const currentSessionStartTimeISO = new Date().toISOString();
dbUtils.createBotStats(db, currentSessionGUID, currentSessionStartTimeISO, config.debugMode?1:0, config.apiSafe?1:0);

const client = new Discord.Client({
    intents: [ Discord.GatewayIntentBits.Guilds]
});

client.cooldowns = new Discord.Collection();
client.commands = new  Discord.Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			logger.loggerWarning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
		};
	};
};

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, db, currentSessionGUID));
	};
};

client.login(config.token)
    .catch(error => {
        logger.loggerError(`${createNewDate()} Error logging in:`, error);
        process.exit(1);
    });

module.exports = db;