const Discord = require('discord.js');
const logger = require('../../modules/logger');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    category: 'botAdmin',
    data: new Discord.SlashCommandBuilder()
        .setName('load')
        .setDescription('RESTRICTED TO BOT ADMINS')
        .addStringOption(category =>
            category.setName('category')
            .setDescription('The category of the command.')
            .setRequired(true)
        )
        .addStringOption(file =>
            file.setName('file')
            .setDescription('The .js file **full name**')
            .setRequired(true)
        ),

    /** @param {Discord.ChatInputCommandInteraction} interaction */
    execute(interaction) {
        if (interaction.user.id !== '244370207190024193') {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: Discord.MessageFlags.Ephemeral
            });
        };

        const category = interaction.options.getString('category', true);
        const file = interaction.options.getString('file');

        const filePath = path.join(__dirname, '../', category, file);

        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            if (interaction.client.commands.get(command.data.name)) {
                return interaction.reply('Command Already exists!');
            }
            else {
                interaction.client.commands.set(command.data.name, command)
                return interaction.reply('Command Added!')
            };
        } else {
            return interaction.reply(`The command at ${filePath} is missing a required "data" or "execute" property.`)
        };
    },
};