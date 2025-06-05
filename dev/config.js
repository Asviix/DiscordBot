require('dotenv').config();

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

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
	.parse()

const config = {
	token: process.env.BOT_TOKEN,
	clientId: process.env.CLIENT_ID,
	guildId: process.env.DEV_GUILD_ID,
    statusVoiceChannelId: process.env.STATUS_VOICE_CHANNEL_ID,
    debugMode: argv.debug,
    apiSafe: argv.apiSafe
}

module.exports = config;