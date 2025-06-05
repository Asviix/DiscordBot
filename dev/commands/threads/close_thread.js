const Discord = require('discord.js');
const logger = require('../../modules/logger.js');

module.exports = {
    category: 'threads',
    cooldown: 20,
    data: new Discord.SlashCommandBuilder()
        .setName('close_thread')
        .setDescription('Closes the current thread with a given reason')
        .addChannelOption(threadOption =>
            threadOption
                .setName('thread')
                .setDescription('The thread to close (defaults to the current thread)')
                .addChannelTypes(Discord.ChannelType.PublicThread, Discord.ChannelType.PrivateThread, Discord.ChannelType.AnnouncementThread)
                .setRequired(true)
        )
        .addStringOption(reason =>
            reason
                .setName('reason')
                .setDescription('The reason for closing the thread')
                .setRequired(true)
        )
        .addBooleanOption(lockThread =>
            lockThread
                .setName('lock_thread')
                .setDescription('Whether to lock the thread after closing it')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageThreads)
        .setContexts([Discord.InteractionContextType.Guild]),
    /** @param {Discord.ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const thread = interaction.options.getChannel('thread');
        const reason = interaction.options.getString('reason');
        const lockThread = interaction.options.getBoolean('lock_thread') || false;

        const CloseThreadEmbed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.members.me.displayName,
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTitle(`**📢 Thread ${lockThread ? 'Closed & Locked' : 'Closed'}**`)
            .setDescription(`**Reason: ${reason}**`)
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        try {
            await thread.send({
                embeds: [CloseThreadEmbed]
            });
            await thread.setArchived(true, reason);
            if (lockThread) await thread.setLocked(true, reason);
            return interaction.reply({
                content: `✅ Thread **${thread.name}** has been ${lockThread ? 'Closed & Locked' : 'Closed'} successfully!`,
                flags: Discord.MessageFlags.Ephemeral
            });
        } catch (error) {
            logger.loggerError(`Error closing thread ${thread.name} in guild ${interaction.guild.name}:`, error);
            return interaction.followUp({
                content: '❌ There was an error while trying to close the thread!',
                flags: Discord.MessageFlags.Ephemeral
            });
        }
    },
};