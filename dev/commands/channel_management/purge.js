const Discord = require('discord.js');

module.exports = {
    category: 'channel_management',
    cooldown: 60,
    data: new Discord.SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge messages from a channel')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to purge messages from (default: current channel)')
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to purge (min: 1) (default: all messages newer than 14 days)')
                .setMinValue(1)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageChannels, Discord.PermissionFlagsBits.ManageMessages)
        .setContexts(Discord.InteractionContextType.Guild),

    /** @param {Discord.ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const amount = interaction.options.getInteger('amount');
        
        if (!targetChannel.isTextBased()) {
            return interaction.reply({
                content: 'You can only purge messages in text channels.',
                flags: Discord.MessageFlags.Ephemeral
            });
        };

        await interaction.reply({
            content: `Purging messages from ${targetChannel}...`
        })

        await targetChannel.bulkDelete(amount || 100, true)

        return interaction.channel.send({
            content: `✅ Purged ${amount ? `${amount} messages` : 'all messages newer than 14 days'} from ${targetChannel}.`
        }).catch(error => {
            console.error('Error editing reply:', error);
            interaction.channel.send({
                content: 'An error occurred while purging messages.'
            });
        });
    },
}