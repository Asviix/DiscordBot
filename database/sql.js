module.exports = {
    STATS_BOT_STARTUP_INSERT: `INSERT OR IGNORE INTO stats_bot  (session_guid, start_time, debug_mode, api_safe) VALUES (?, ?, ?, ?)`,
    STATS_BOT_INCREMENT_COMMANDS_RAN_UPDATE: `UPDATE stats_bot SET commands_ran = commands_ran + 1 WHERE session_guid = ?`,
    STATS_BOT_INCREMENT_ERRORS_LOGGED_UPDATE: `UPDATE stats_bot SET errors_logged = errors_logged + 1 WHERE session_guid = ?`,
    STATS_BOT_CREATE_TABLE:
    `CREATE TABLE IF NOT EXISTS stats_bot (
        session_guid TEXT NOT NULL PRIMARY KEY,
        start_time TEXT NOT NULL,
        debug_mode INTEGER NOT NULL,
        api_safe INTEGER NOT NULL,
        commands_ran INTEGER NOT NULL DEFAULT 0,
        errors_logged INTEGER NOT NULL DEFAULT 0
    );`,

    STATS_COMMANDS_INCREMENT_EXECUTION_COUNT: `UPDATE stats_commands SET execution_count = execution_count + 1, last_executed = CURRENT_TIMESTAMP WHERE command_name = ?`,
    STATS_COMMANDS_CREATE_TABLE: 
    `CREATE TABLE IF NOT EXISTS stats_commands (
		command_name TEXT NOT NULL PRIMARY KEY,
		execution_count INTEGER NOT NULL DEFAULT 0,
		last_executed DATETIME DEFAULT CURRENT_TIMESTAMP
	);`,

    GUILD_DATA_NEW_GUILD_INSERT: `INSERT OR IGNORE INTO guild_data (guild_id) VALUES (?)`,
    GUILD_DATA_CREATE_TABLE:
    `CREATE TABLE IF NOT EXISTS guild_data (
        guild_id TEXT PRIMARY KEY,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		commands_ran INTEGER NOT NULL DEFAULT 0
    );`,

    LOGS_LOG_ERROR_TO_DB: `INSERT INTO logs (session_guid, guild_id, user_id, command, error_message, stack_trace) VALUES (?, ?, ?, ?, ?, ?)`,
    LOGS_CREATE_TABLE:
    `CREATE TABLE IF NOT EXISTS logs (
		error_id INTEGER PRIMARY KEY AUTOINCREMENT,
		session_guid TEXT NOT NULL,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		guild_id TEXT,
		user_id TEXT,
		command TEXT,
		error_message TEXT NOT NULL,
		stack_trace TEXT
	);`,

    USER_DATA_NEW_USER_INSERT: `INSERT OR IGNORE INTO user_data (user_id, guild_id)  VALUES (?, ?)`,
    USER_DATA_CREATE_TABLE:
    `CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
		commands_ran INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (user_id, guild_id)
    );`
};