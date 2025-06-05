const Discord = require('discord.js');

module.exports = {
    category: 'utility',
    cooldown: 10,
    data: new Discord.SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get the statistics of any user/guild.')
        .addUserOption(userOption =>
            userOption.setName('user')
            .setDescription('The user you wants the stats of.')
            .setRequired(false)
        )
        .setContexts(Discord.InteractionContextType.Guild),
    
    /** @param {Discord.ChatInputCommandInteraction} interaction */
    async execute(interaction) {

        const member = interaction.options.getMember('user');

        const flagsArray = interaction.user.flags.toArray();

        const flagDetails = {
            DiscordEmployee: { name: "Discord Employee", icon: "💼" },
            Partner: { name: "Partnered Server Owner", icon: "<a:PartneredServerOwner:1379421956612296847>" },
            Hypesquad: { name: "HypeSquad Events Member", icon: "<:HypeSquadEvents:1379423604751597631>" },
            BugHunterLevel1: { name: "Bug Hunter (Level 1)", icon: "<:BugHunter1:1379423260575268976>" },
            BugHunterLevel2: { name: "Bug Hunter (Level 2)", icon: "<:BugHunter2:1379423261858725938>" },
            HypeSquadOnlineHouse1: { name: "HypeSquad Bravery", icon: "<a:Bravery:1379411821206835276> " },
            HypeSquadOnlineHouse2: { name: "HypeSquad Brilliance", icon: "<a:Brilliance:1379411819214405774> " },
            HypeSquadOnlineHouse3: { name: "HypeSquad Balance", icon: "<a:Balance:1379411817687679036>" },
            PremiumEarlySupporter: { name: "Early Supporter", icon: "<:EarlySupporter:1379413974369566761>" },
            EarlySupporter: { name: "Early Supporter", icon: "<:EarlySupporter:1379413974369566761>" },
            TeamPseudoUser: { name: "Team User", icon: "🤝" },
            VerifiedBot: { name: "Verified Bot", icon: "☑️" },
            EarlyVerifiedBotDeveloper: { name: "Early Verified Bot Developer", icon: "<:EarlyBotDeveloper:1379413865921777774>" },
            VerifiedDeveloper: { name: "Verified Bot Developer", icon: "<:VerifiedDeveloper:1379413446038392852>" },
            CertifiedModerator: { name: "Discord Certified Moderator", icon: "<:CertifiedModerator:1379413631439212614>" },
            ActiveDeveloper: { name: "Active Developer", icon: "<:ActiveDeveloper:1379413760661520414>" },
        };

        const hiddenFlags = [
            "Staff",
            "Member",
            "MFASMS",
            "PremiumPromoDismissed",
            "HasUnreadUrgentMessages",
            "DisablePremium",
            "BotHTTPInteractions",
            "Spammer"
        ];

        const displayableFlags = flagsArray
            .filter(flag => !hiddenFlags.includes(flag))
            .map(flagString => {
                const detail = flagDetails[flagString];
                var returnType;
                flagsArray.length < 6 ? returnType = `${detail.icon} ${detail.name}` : returnType = `${detail.icon}`;
                return returnType;
        });

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.members.me.displayName,
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTitle(`Statistics of ${member.displayName}`)
            .setThumbnail(member.avatarURL() ?? member.user.avatarURL())
            .addFields(
                {
                    name: '**---Basic Statistics---**',
                    value: 
                        `\\- **Full Username**
                        ${member.user.tag}

                        ${displayableFlags.length != 0 ? `**\\- Flags**\n${displayableFlags.join(flagsArray > 5 ? '\n' : ' ')}` : ''}

                        **\\- Discord Join Date**
                        <t:${Math.floor(member.user.createdTimestamp / 1000)}>`
                }
            )
            .setFooter({
                text: interaction.guild.name + ' Utility',
                iconURL: interaction.guild.iconURL() || ''
            })
        
        interaction.reply({
            embeds: [embed]
        });
    },
}