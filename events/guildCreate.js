const Discord = require('discord.js');
const logger = require('../modules/logger')

module.exports = {
    name: Discord.Events.GuildCreate,

    /** @param {Discord.Guild} guild */
    execute(guild) {

        logger.loggerDebug(`Added to Guild: "${guild.name}" - ${guild.id}`);

        guild.fetchOwner()
            .then(owner => {
                owner.send('Boo!\nThis bot is still in **ACTIVE DEVELOPMENT, YOU SHOULD NOT ADD IT!**');
            });
    },
};