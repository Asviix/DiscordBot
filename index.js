const fs = require('node:fs');
const path = require('node:path');
const Discord = require('discord.js');
const config = require('./config.js');
const logger = require('./modules/logger.js');
const { db, currentSessionGUID } = require('./database/database.js');

logger.loggerDebug('Debug Mode is Enabled!');

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