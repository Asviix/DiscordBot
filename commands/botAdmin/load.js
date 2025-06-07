import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { join } from 'node:path';

export const category = 'botAdmin';
export const data = new SlashCommandBuilder()
    .setName('load')
    .setDescription('RESTRICTED TO BOT ADMINS')
    .addStringOption(category => category.setName('category')
        .setDescription('The category of the command.')
        .setRequired(true)
    )
    .addStringOption(file => file.setName('file')
        .setDescription('The .js file **full name**')
        .setRequired(true)
    );

/** @type {import('../../database/types').CommandExecuteFunction} */
export function execute(interaction, db, guid) {
    if (interaction.user.id !== '244370207190024193') {
        return interaction.reply({
            content: 'You do not have permission to use this command.',
            flags: MessageFlags.Ephemeral
        });
    };

    const category = interaction.options.getString('category', true);
    const file = interaction.options.getString('file');

    const filePath = join(__dirname, '../', category, file);

    const command = import(filePath);

    if ('data' in command && 'execute' in command) {
        if (interaction.client.commands.get(command.data.name)) {
            return interaction.reply('Command Already exists!');
        }
        else {
            interaction.client.commands.set(command.data.name, command);
            return interaction.reply('Command Added!');
        };
    } else {
        return interaction.reply(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    };
}