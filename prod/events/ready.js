const Discord = require('discord.js');
const config = require('../config.js')
const logger = require('../modules/logger');

module.exports = {
	name: Discord.Events.ClientReady,
	once: true,
	
	/** @param {Discord.Client} client */
	execute(client) {
		logger.loggerLog('----------------------------NEW SESSION----------------------------');

		if (!config.apiSafe) {
			// FETCH AUDIT LOGS TO PREVENT API NON-SENSE
			logger.loggerLog('Changing status channel...');
			client.channels.cache.get(config.statusVoiceChannelId).setName('✅ Status: Online!');
			logger.loggerSuccess('Status channel changed successfully!');
		} else {
			logger.loggerWarning('API SAFE RATE LIMIT IS ON, SKIPPING API INTENSIVE METHODS');
		};

		logger.loggerSuccess(`${client.user.tag} is online and ready!`);
	},
};