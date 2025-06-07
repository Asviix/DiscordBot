import { Events, MessageFlags } from 'discord.js';
import { loggerDebug, loggerError } from '../modules/logger.js';
import { incrementExecutionCountStats, handleError, insertNewGuildAndUser } from '../database/transactions/manager.js'
import { checkCooldown } from '../modules/cooldown.js';

export const name = Events.InteractionCreate;

/** @type {import('../database/types.js').CommandExecuteFunction} */
export async function execute(interaction, db, guid) {
	insertNewGuildAndUser(db, interaction.guild.id, interaction.user.id);

	if (!interaction.isChatInputCommand()) {
		return;
	};

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		return;
	};

	const cooldownCheck = checkCooldown(interaction, command);
	if (cooldownCheck.onCooldown) {
		return interaction.reply({
			content: cooldownCheck.reply,
			flags: MessageFlags.Ephemeral
		});
	};

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