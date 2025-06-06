import { Events, Collection, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { loggerDebug, loggerError } from '../modules/logger.js';
import { GUILD_DATA_NEW_GUILD_INSERT } from '../database/managers/guildDataManager.js';
import { USER_DATA_NEW_USER_INSERT } from '../database/managers/userDataManager.js';
import { incrementExecutionCountStats } from '../database/transactions/statsManager.js';
import { handleError } from '../database/transactions/errorManager.js';

export const name = Events.InteractionCreate;
export
	/** @param {Discord.ChatInputCommandInteraction} interaction */
	async function execute(interaction, db, guid) {

	GUILD_DATA_NEW_GUILD_INSERT(db, interaction.guild.id);
	USER_DATA_NEW_USER_INSERT(db, interaction.user.id, interaction.guild.id);

	const { cooldowns } = interaction.client;

	if (!interaction.isChatInputCommand()) {
		return;
	};

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		return;
	};

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	};

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({
				content: `⌛ Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
				flags: MessageFlags.Ephemeral
			});
		};
	};

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	incrementExecutionCountStats(db, {
		guid: guid,
		commandName: interaction.commandName,
		guildId: interaction.guild.id,
		userId: interaction.user.id
	});

	try {
		await command.execute(interaction, db, guid);
		return loggerDebug(`Executed command: "${interaction.commandName}" in guild: "${interaction.guild.name}" by user: "${interaction.user.tag}"`);
	} catch (error) {
		handleError(db, {
			guid: guid,
			commandName: interaction.commandName,
			guildId: interaction.guild.id,
			userId: interaction.user.id,
			error: error
		});
		loggerError(`Error executing command "${interaction.commandName}" in "${interaction.guild.name}" by user: "${interaction.user.tag}":`, error);
		if (interaction.replied || interaction.deferred) {
			return interaction.followUp({
				content: '❌ There was an error while executing this command!',
				flags: MessageFlags.Ephemeral
			});
		} else {
			return interaction.reply({
				content: '❌ There was an error while executing this command!',
				flags: MessageFlags.Ephemeral
			});
		};
	};
}