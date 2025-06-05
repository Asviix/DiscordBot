const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
	.option('token', {
		alias: 't',
		type: 'string',
		description: 'Discord Bot Token',
		demandOption: true
	})
    .option('enviromment', {
        alias: 'e',
        type: 'string',
        description: 'Deployment enviromment: "dev" or "prod"',
        choices: ['dev', 'prod'],
        demandOption: true
    })
	.option('clientId', {
        alias: 'c',
        type: 'string',
        description: 'Discord Bot Client ID',
        demandOption: true // Makes this argument required
    })
    .option('scope', {
        alias: 's',
        type: 'string',
        description: 'Deployment scope: "global", "guild" or "remove"',
        choices: ['global', 'guild', 'remove'],
        demandOption: true
    })
    .option('guildId', {
        alias: 'g',
        type: 'string',
        description: 'Guild ID for "guild" scope deployment (or if removing) (required if scope is "guild")'
    })
    .option('excludeFolders', {
        alias: 'ef',
        type: 'string',
        description: 'Comma-separated list of command folders to exclude (e.g., botAdmin,otherFolder)'
    })
    .option('includeFolders', { // New option
        alias: 'if',
        type: 'string',
        description: 'Comma-separated list of command folders to EXCLUSIVELY include (e.g., botAdmin,anotherFolder). If used, excludeFolders is ignored.'
    })
    .check((argv) => {
        if (argv.scope === 'guild' && (!argv.guildId || argv.guildId.trim() === '')) {
            throw new Error("Error: --guildId (-g) is required when scope is 'guild'.");
        }
        // No specific check needed for guildId with 'remove' scope yet, as it can be global or guild
        return true;
    })
    .help()
    .argv;

// --- Command Loading ---
const commandsToDeploy = [];
if (argv.scope !== 'remove') {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFoldersInput = fs.readdirSync(foldersPath);
    let activeCommandFolders;

    if (argv.includeFolders) {
        const foldersToInclude = argv.includeFolders.split(',').map(f => f.trim());
        activeCommandFolders = commandFoldersInput.filter(folder => foldersToInclude.includes(folder));
        console.log(`Exclusively including and loading commands from folders: ${activeCommandFolders.join(', ') || 'None (check includeFolders list or folder names)'}`);
    } else {
        const foldersToExclude = argv.excludeFolders ? argv.excludeFolders.split(',').map(f => f.trim()) : [];
        activeCommandFolders = commandFoldersInput.filter(folder => !foldersToExclude.includes(folder));
        if (foldersToExclude.length > 0) {
            console.log(`Excluding folders: ${foldersToExclude.join(', ')}`);
        };
        console.log(`Loading commands from folders (after exclusions): ${activeCommandFolders.join(', ') || 'None'}`);
    };

    for (const folder of activeCommandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commandsToDeploy.push(command.data.toJSON()); // Ensure this is the array you use later
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            };
        };
    };
};

// --- REST Module Instance ---
// Use the token from the command-line arguments
const rest = new REST().setToken(argv.token);

// --- Deploy Commands ---
(async () => {
    try {
        const bodyForDiscord = (argv.scope === 'remove') ? [] : commandsToDeploy;
        let route;
        let scopeDescription;

        if (argv.scope === 'global') {
            route = Routes.applicationCommands(argv.clientId);
            scopeDescription = 'global application (/) commands';
            console.log(`Started refreshing ${commandsToDeploy.length} ${scopeDescription}.`);
            await rest.put(Routes.applicationCommands(argv.clientId), { body: [] }); // Optional: clear all global first
        } else if (argv.scope === 'guild') {
            route = Routes.applicationGuildCommands(argv.clientId, argv.guildId);
            scopeDescription = `guild (${argv.guildId}) application (/) commands`;
            console.log(`Started refreshing ${commandsToDeploy.length} ${scopeDescription}.`);
            await rest.put(Routes.applicationGuildCommands(argv.clientId, argv.guildId), { body: [] });
            console.log(`Successfully cleared commands for guild ${argv.guildId}.`);
        } else if (argv.scope === 'remove') {
            if (argv.guildId) {
                // Remove guild-specific commands
                route = Routes.applicationGuildCommands(argv.clientId, argv.guildId);
                scopeDescription = `remove ALL application (/) commands for guild (${argv.guildId})`;
            } else {
                // Remove global commands
                route = Routes.applicationCommands(argv.clientId);
                scopeDescription = `remove ALL global application (/) commands`;
            };
            console.log(`Preparing to ${scopeDescription}.`);
        } else {
            // This case should ideally be caught by yargs' choices validation,
            // but as a fallback:
            console.error('Invalid scope provided. Use "global" or "guild".');
            process.exit(1);
        };

        if (argv.scope !== 'remove' && commandsToDeploy.length === 0) {
            console.log('No commands selected to deploy. This might be due to folder exclusions or empty command files.');
        };
        
        console.log(`Started operation: ${scopeDescription}.`);
        const data = await rest.put(route, { body: bodyForDiscord });

        if (argv.scope === 'remove') {
            console.log(`Successfully sent request to unregister commands. Target: ${scopeDescription.split(" ALL ")[1]}. Discord API usually returns an empty array or confirms 0 commands for successful deletion.`);
        } else {
            console.log(`Successfully reloaded ${data.length} application (/) commands for ${scopeDescription.split(" for ")[1] || 'global'}.`);
        };

    } catch (error) {
        console.error('Error deploying commands:');
        console.error(error);
        process.exit(1); // Exit with an error code
    };
})();