const Discord = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: Discord.Events.ThreadCreate,
    
    /** @param {Discord.AnyThreadChannel} channel */
    execute(channel) {
        return;
    },
};