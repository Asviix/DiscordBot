import { Events } from 'discord.js';
import { config } from '../config.js';
import { loggerLog, loggerSuccess, loggerWarning } from '../modules/logger.js';

export const name = Events.ClientReady;
export const once = true;
export function execute(client) {
	loggerLog('----------------------------NEW SESSION----------------------------');

	if (!config.apiSafe) {
		// FETCH AUDIT LOGS TO PREVENT API NON-SENSE
		loggerLog('Changing status channel...');
		client.channels.cache.get(config.statusVoiceChannelId).setName('✅ Status: Online!');
		loggerSuccess('Status channel changed successfully!');
	} else {
		loggerWarning('API SAFE RATE LIMIT IS ON, SKIPPING API INTENSIVE METHODS');
	};

	loggerSuccess(`${client.user.tag} is online and ready!`);
}