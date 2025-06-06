import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { loggerError } from '../../modules/logger.js';


export const category = 'botAdmin';
export const data = new SlashCommandBuilder()
	.setName('reload')
	.setDescription('RESTRICTED TO BOT ADMINS')
	.addStringOption(option => option.setName('command')
		.setDescription('Command to reload.')
		.setRequired(true)
	);
export function execute(interaction) {
	if (interaction.user.id !== '244370207190024193') {
		return interaction.reply({
			content: 'You do not have permission to use this command.',
			flags: MessageFlags.Ephemeral
		});
	};

	const commandName = interaction.options.getString('command', true).toLowerCase();
	const command = interaction.client.commands.get(commandName);

	if (!command) {
		return interaction.reply(`There is no command with name \`${commandName}\`!`);
	}

	delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

	try {
		const newCommand = require(`../${command.category}/${command.data.name}.js`);
		interaction.client.commands.set(newCommand.data.name, newCommand);
		return interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
	} catch (error) {
		loggerError(`Error reloading command \`${command.data.name}\`:`, error);
		return interaction.reply(`There was an error while reloading the command !`);
	}
}