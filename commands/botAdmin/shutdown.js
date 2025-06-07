import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { config } from '../../config.js';
import { loggerSuccess } from '../../modules/logger.js';

export const category = 'botAdmin';
export const data = new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('RESTRICTED TO BOT ADMINS');

/** @type {import('../../database/types.js').CommandExecuteFunction} */
export async function execute(interaction, db, guid) {
    if (interaction.user.id !== '244370207190024193') {
        return interaction.reply({
            content: 'You do not have permission to use this command.',
            flags: MessageFlags.Ephemeral
        });
    };
    await interaction.reply({
        content: 'Shutting down the bot...',
        flags: MessageFlags.Ephemeral
    });

    if (!config.apiSafe) {
        interaction.client.channels.cache.get(config.statusVoiceChannelId).setName('❌ Status: Offline!');
        loggerSuccess('Status channel changed successfully!');
    }

    loggerSuccess('Bot is shutting down...');
    await interaction.client.destroy();
    process.exit(0);
}