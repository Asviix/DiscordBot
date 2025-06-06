import { Events } from 'discord.js';
import { loggerDebug } from '../modules/logger.js';

export const name = Events.GuildCreate;
export function execute(guild) {

    loggerDebug(`Added to Guild: "${guild.name}" - ${guild.id}`);

    guild.fetchOwner()
        .then(owner => {
            owner.send('Boo!\nThis bot is still in **ACTIVE DEVELOPMENT, YOU SHOULD NOT ADD IT!**');
        });
}