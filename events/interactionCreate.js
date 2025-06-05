const Discord = require('discord.js');
const logger = require('../modules/logger.js');
const dbUtils = require('../dbUtils.js')

module.exports = {
	name: Discord.Events.InteractionCreate,
	
	/** @param {Discord.ChatInputCommandInteraction} interaction */
	async execute(interaction, db, guid) {

		const guildData = dbUtils.ensureGuildData(db, interaction.guild.id);
		const userData = dbUtils.ensureUserData(db, interaction.user.id, interaction.guild.id);

		if (!guildData || !userData) {
			await interaction.reply({
				content: 'Count not retrieve databse data.',
				flags: Discord.MessageFlags.Ephemeral
			});
			return;
		};

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

		dbUtils.incrementCommandsRan(db, guid);

		try {
			await command.execute(interaction);
			return logger.loggerDebug(`Executed command: "${interaction.commandName}" in guild: "${interaction.guild.name}" by user: "${interaction.user.tag}"`);
		} catch (error) {
			dbUtils.incrementErrorsLogged(db, guid);
			dbUtils.logErrorToDB(db, guid, error, {
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