require('dotenv').config();

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/**
 * The application configuration object.
 * @typedef {Object} Config
 * @property {string} token - The bot token for Discord authentication.
 * @property {string} clientId - The client ID of the Discord application.
 * @property {string} guildId - The ID of the development guild for testing.
 * @property {string} statusVoiceChannelId - The ID of the voice channel for status updates.
 * @property {boolean} debugMode - Flag to enable debug verbose logging.
 * @property {boolean} apiSafe - Flag to limit API requests to prevent rate limiting.
 */

const argv = yargs(hideBin(process.argv))
	.option('debug', {
		alias: 'd',
		type: 'boolean',
		description: 'Enable Debug Verbose Logging',
		default: false,
	})
	.option('apiSafe', {
		alias: 'a',
		type: 'boolean',
		description: 'Limits API Requests to prevent Rate Limiting',
		default: false,
	})
	.parse();

/** @type {Config} */
const config = {
	token: process.env.BOT_TOKEN,
	clientId: process.env.CLIENT_ID,
	guildId: process.env.DEV_GUILD_ID,
    statusVoiceChannelId: process.env.STATUS_VOICE_CHANNEL_ID,
    debugMode: argv.debug,
    apiSafe: argv.apiSafe
};

module.exports = config;