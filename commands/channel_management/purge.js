import { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, MessageFlags } from 'discord.js';

export const category = 'channel_management';
export const cooldown = 60;
export const data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge messages from a channel')
    .addChannelOption(option => option.setName('channel')
        .setDescription('The channel to purge messages from (default: current channel)')
        .setRequired(false)
    )
    .addIntegerOption(option => option.setName('amount')
        .setDescription('Number of messages to purge (min: 1) (default: all messages newer than 14 days)')
        .setMinValue(1)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild);
export
    /** @param {Discord.ChatInputCommandInteraction} interaction */
    async function execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const amount = interaction.options.getInteger('amount');

    if (!targetChannel.isTextBased()) {
        return interaction.reply({
            content: 'You can only purge messages in text channels.',
            flags: MessageFlags.Ephemeral
        });
    };

    await interaction.reply({
        content: `Purging messages from ${targetChannel}...`
    });

    await targetChannel.bulkDelete(amount || 100, true);

    return interaction.channel.send({
        content: `✅ Purged ${amount ? `${amount} messages` : 'all messages newer than 14 days'} from ${targetChannel}.`
    }).catch(error => {
        console.error('Error editing reply:', error);
        interaction.channel.send({
            content: 'An error occurred while purging messages.'
        });
    });
}