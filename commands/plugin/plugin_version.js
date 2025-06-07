import { SlashCommandBuilder, InteractionContextType, EmbedBuilder } from 'discord.js';

export const category = 'plugin';
export const cooldown = 5;
export const data = new SlashCommandBuilder()
    .setName('plugin_version')
    .setDescription('Get the latest version of the F1 Manager 2024 SimHub plugin')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM]);

/** @type {import('../../database/types').CommandExecuteFunction} */
export function execute(interaction, db, guid) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: interaction.guild.members.me.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTitle('**Latest Version is 1.0 !**')
        .setDescription('You can download it from [Overtake.gg](<https://www.overtake.gg/downloads/f1-manager-2024-simhub-plugin.76597/>) !')
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();

    return interaction.reply({
        embeds: [embed]
    });
}