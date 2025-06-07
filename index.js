import 'dotenv/config';
import { pathToFileURL } from 'node:url'; 
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from './config.js';
import { loggerDebug, loggerWarning, loggerError } from './modules/logger.js';
import { db, currentSessionGUID } from './database/database.js';

loggerDebug('Debug Mode is Enabled!');

const client = new Client({
    intents: [ GatewayIntentBits.Guilds]
});

client.cooldowns = new Collection();
client.commands = new Collection();

// Use an async IIFE (Immediately Invoked Function Expression) to handle top-level await
(async () => {
    try {
        loggerDebug('Loading commands and events...');

        // --- COMMAND HANDLER ---
        const foldersPath = join(import.meta.dirname, 'commands');
        const commandFolders = readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = join(foldersPath, folder);
            const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = join(commandsPath, file);
                const fileUrl = pathToFileURL(filePath); // Convert path to URL

                // Use async import() instead of require()
                const module = await import(fileUrl.href);
                const command = module.default || module; // Handle default or named exports

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    loggerWarning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        // --- EVENT HANDLER ---
        const eventsPath = join(import.meta.dirname, 'events');
        const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = join(eventsPath, file);
            const fileUrl = pathToFileURL(filePath);

            const module = await import(fileUrl.href);
            const event = module.default || module;

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args, db, currentSessionGUID));
            }
        }

        loggerDebug('Successfully loaded commands and events.');

        // --- BOT LOGIN ---
        // It's important to log in only AFTER all commands and events are loaded.
        await client.login(config.token);

    } catch (error) {
        // Since createNewDate() is in your logger module, use the logger directly
        loggerError(`Error during client setup or login:`, error);
        process.exit(1);
    }
})(); // Immediately invoke the async function