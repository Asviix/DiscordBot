const Discord = require('discord.js');

module.exports = {
    category: 'plugin',
    cooldown: 5,
    data: new Discord.SlashCommandBuilder()
        .setName('plugin_version')
        .setDescription('Get the latest version of the F1 Manager 2024 SimHub plugin')
        .setContexts([Discord.InteractionContextType.Guild, Discord.InteractionContextType.BotDM]),
        
    /** @param {Discord.ChatInputCommandInteraction} interaction */
    execute(interaction) {
        const embed = new Discord.EmbedBuilder()
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
    },
};