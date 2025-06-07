import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, InteractionContextType, EmbedBuilder, MessageFlags } from 'discord.js';
import { loggerError } from '../../modules/logger.js';

export const category = 'threads';
export const cooldown = 20;
export const data = new SlashCommandBuilder()
    .setName('move_thread')
    .setDescription('Moves the current thread to a different channel')
    .addChannelOption(sourceThread => sourceThread
        .setName('source_thread')
        .setDescription('The thread to move')
        .addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread)
        .setRequired(true)
    )
    .addChannelOption(targetThread => targetThread
        .setName('target_thread')
        .setDescription('The channel to move the thread to')
        .addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread)
        .setRequired(true)
    )
    .addStringOption(reason => reason
        .setName('reason')
        .setDescription('The reason for moving the thread')
        .setRequired(true)
    )
    .addBooleanOption(closeOriginalThread => closeOriginalThread
        .setName('close_original_thread')
        .setDescription('Whether to close the original thread after moving')
        .setRequired(false)
    )
    .addBooleanOption(lockOriginalThread => lockOriginalThread
        .setName('lock_original_thread')
        .setDescription('Whether to lock the original thread after moving')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
    .setContexts([InteractionContextType.Guild]);

/** @type {import('../../database/types.js').CommandExecuteFunction} */
export async function execute(interaction, db, guid) {

    const sourceThread = interaction.options.getChannel('source_thread');
    const targetThread = interaction.options.getChannel('target_thread');
    const reason = interaction.options.getString('reason');
    const closeOriginalThread = interaction.options.getBoolean('close_original_thread') || false;
    const lockOriginalThread = interaction.options.getBoolean('lock_original_thread') || false;

    const sourceEmbed = new EmbedBuilder()
        .setAuthor({
            name: interaction.guild.members.me.displayName,
            iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTitle('📢 Thread Moved')
        .setDescription(`**Reason: ${reason}**\n\nSee <#${targetThread.id}> in <#${targetThread.parentId}> for the moved thread.`)
        .setFooter({
            text: interaction.guild.name + ' Threads',
            iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();

    const targetEmbed = new EmbedBuilder()
        .setAuthor({
            name: interaction.guild.members.me.displayName,
            iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTitle('📢 Thread Moved')
        .setDescription(`**Reason: ${reason}**\n\nSee <#${sourceThread.id}> in <#${sourceThread.parentId}> for the original thread.`)
        .setFooter({
            text: interaction.guild.name + ' Threads',
            iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();

    await sourceThread.send({
        embeds: [sourceEmbed]
    });

    await targetThread.send({
        embeds: [targetEmbed]
    });

    try {
        await interaction.reply({
            content: `Thread has been moved to <#${targetThread.id}>.`,
            flags: MessageFlags.Ephemeral
        });
        if (closeOriginalThread) await sourceThread.setArchived(true, reason);
        if (lockOriginalThread) await sourceThread.setLocked(true, reason);
        return;
    } catch (error) {
        loggerError(`Error moving thread ${sourceThread.name} to ${targetThread.name}:`, error);
        return interaction.followUp({
            content: 'There was an error while trying to move the thread.',
            flags: MessageFlags.Ephemeral
        });
    }
}