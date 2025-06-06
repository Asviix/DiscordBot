export const STATS_BOT_STARTUP_INSERT = `INSERT OR IGNORE INTO stats_bot  (session_guid, start_time, debug_mode, api_safe) VALUES (?, ?, ?, ?)`;
export const STATS_BOT_INCREMENT_COMMANDS_RAN_UPDATE = `UPDATE stats_bot SET commands_ran = commands_ran + 1 WHERE session_guid = ?`;
export const STATS_BOT_INCREMENT_ERRORS_LOGGED_UPDATE = `UPDATE stats_bot SET errors_logged = errors_logged + 1 WHERE session_guid = ?`;
export const STATS_BOT_CREATE_TABLE = 
    `CREATE TABLE IF NOT EXISTS stats_bot (
        session_guid TEXT NOT NULL PRIMARY KEY,
        start_time TEXT NOT NULL,
        debug_mode INTEGER NOT NULL,
        api_safe INTEGER NOT NULL,
        commands_ran INTEGER NOT NULL DEFAULT 0,
        errors_logged INTEGER NOT NULL DEFAULT 0
    );`;

export const STATS_COMMANDS_INCREMENT_EXECUTION_COUNT = 
    `INSERT INTO stats_commands (command_name, execution_count, last_executed)
    VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(command_name) DO UPDATE SET
        execution_count = execution_count + 1,
        last_executed = CURRENT_TIMESTAMP;`;
export const STATS_COMMANDS_CREATE_TABLE = 
    `CREATE TABLE IF NOT EXISTS stats_commands (
		command_name TEXT NOT NULL PRIMARY KEY,
		execution_count INTEGER NOT NULL DEFAULT 0,
		last_executed DATETIME DEFAULT CURRENT_TIMESTAMP
	);`;

export const GUILD_DATA_NEW_GUILD_INSERT = `INSERT OR IGNORE INTO guild_data (guild_id) VALUES (?)`;
export const GUILD_DATA_COMMANDS_RAN_INCREMENT = `UPDATE guild_data SET commands_ran = commands_ran + 1 WHERE guild_id = ?`;
export const GUILD_DATA_CREATE_TABLE = 
    `CREATE TABLE IF NOT EXISTS guild_data (
        guild_id TEXT PRIMARY KEY,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		commands_ran INTEGER NOT NULL DEFAULT 0
    );`;

export const LOGS_LOG_ERROR_TO_DB = `INSERT INTO logs (session_guid, guild_id, user_id, command, error_message, stack_trace) VALUES (?, ?, ?, ?, ?, ?)`;
export const LOGS_CREATE_TABLE = 
    `CREATE TABLE IF NOT EXISTS logs (
		error_id INTEGER PRIMARY KEY AUTOINCREMENT,
		session_guid TEXT NOT NULL,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		guild_id TEXT,
		user_id TEXT,
		command TEXT,
		error_message TEXT NOT NULL,
		stack_trace TEXT
	);`;

export const USER_DATA_NEW_USER_INSERT = `INSERT OR IGNORE INTO user_data (user_id, guild_id)  VALUES (?, ?)`;
export const USER_DATA_COMMANDS_RAN_INCREMENT = `UPDATE user_data SET commands_ran = commands_ran + 1 WHERE user_id = ? AND guild_id = ?`;
export const USER_DATA_CREATE_TABLE = 
    `CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
		commands_ran INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (user_id, guild_id)
    );`;