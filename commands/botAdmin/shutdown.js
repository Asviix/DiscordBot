const Discord = require('discord.js');
const config = require('../../config.js');
const logger = require('../../modules/logger.js');

module.exports = {
    category: 'botAdmin',
    data: new Discord.SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('RESTRICTED TO BOT ADMINS'),

    /** @param {Discord.ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        if (interaction.user.id !== '244370207190024193') {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: Discord.MessageFlags.Ephemeral
            });
        };
        await interaction.reply({
            content: 'Shutting down the bot...',
            flags: Discord.MessageFlags.Ephemeral
        });

        if (!config.apiSafe) {
            interaction.client.channels.cache.get(config.statusVoiceChannelId).setName('❌ Status: Offline!');
            logger.loggerSuccess('Status channel changed successfully!');
        }

        logger.loggerSuccess('Bot is shutting down...');
        await interaction.client.destroy()
        process.exit(0);
    },
}