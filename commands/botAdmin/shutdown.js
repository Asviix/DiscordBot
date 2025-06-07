import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { config } from '../../config.js';
import { loggerSuccess } from '../../modules/logger.js';
import { BOT_STATS_SHUTDOWN_UPDATE } from '../../database/managers/statsBotManager.js';

export const category = 'botAdmin';
export const data = new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('RESTRICTED TO BOT ADMINS')
    .addStringOption(message =>
        message.setName('exit_message')
            .setDescription('The message to log on shutdown')
            .setRequired(true)
    )

/** @type {import('../../database/types.js').CommandExecuteFunction} */
export async function execute(interaction, db, guid) {
    const exitMessage = interaction.options.getString('exit_message');

    if (interaction.user.id !== '244370207190024193') {
        return interaction.reply({
            content: 'You do not have permission to use this command.',
            flags: MessageFlags.Ephemeral
        });
    };

    await interaction.reply({
        content: 'Writing shutdown stats to the database...',
        flags: MessageFlags.Ephemeral
    });

    const shutdownResult = BOT_STATS_SHUTDOWN_UPDATE(db, guid, 0, exitMessage);
    if (!shutdownResult.success) {
        return interaction.reply({
            content: '❌ Failed to update shutdown stats in the database.',
            flags: MessageFlags.Ephemeral
        });
    };

    await interaction.editReply({
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