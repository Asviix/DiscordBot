const Discord = require('discord.js');
const logger = require('../modules/logger.js');
const guildDataManager = require('../database/managers/guildDataManager.js');
const userDataManager = require('../database/managers/userDataManager.js');
const logsManager = require('../database/managers/logsManager.js');
const statsCommandsManager = require('../database/managers/statsCommandsManager.js');
const statsBotManager = require('../database/managers/statsBotManager.js');

module.exports = {
	name: Discord.Events.InteractionCreate,
	
	/** @param {Discord.ChatInputCommandInteraction} interaction */
	async execute(interaction, db, guid) {

		guildDataManager.GUILD_DATA_NEW_GUILD_INSERT(db, interaction.guild.id);
		userDataManager.USER_DATA_NEW_USER_INSERT(db, interaction.user.id, interaction.guild.id);

		const { cooldowns } = interaction.client;

		if (!interaction.isChatInputCommand()) {
			return;
		};

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			return;
		};

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Discord.Collection());
		};

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

		if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime && !interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({
				content: `⌛ Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
				flags: Discord.MessageFlags.Ephemeral
			});
			};
		};

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		statsBotManager.BOT_STATS_INCREMENT_COMMANDS_RAN_UPDATE(db, guid);
		statsCommandsManager.STATS_COMMANDS_INCREMENT_EXECUTION_COUNT(db, interaction.commandName);

		try {
			await command.execute(interaction, db, guid);
			return logger.loggerDebug(`Executed command: "${interaction.commandName}" in guild: "${interaction.guild.name}" by user: "${interaction.user.tag}"`);
		} catch (error) {
			statsBotManager.BOT_STATS_INCREMENT_ERRORS_LOGGED_UPDATE(db, guid);
			logsManager.LOGS_LOG_ERROR_TO_DB_INSERT(db, guid, error, {
				guildId: interaction.guild.id,
				userId: interaction.user.id,
				commandName: interaction.commandName
			});
			logger.loggerError(`Error executing command "${interaction.commandName}" in "${interaction.guild.name}" by user: "${interaction.user.tag}":`, error);
			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					content: '❌ There was an error while executing this command!',
					flags: Discord.MessageFlags.Ephemeral
				});
			} else {
				return interaction.reply({
					content: '❌ There was an error while executing this command!',
					flags: Discord.MessageFlags.Ephemeral
				});
			};
		};
	},
};