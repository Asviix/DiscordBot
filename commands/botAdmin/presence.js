import { SlashCommandBuilder } from 'discord.js';

export const category = 'botAdmin';
export const data = new SlashCommandBuilder()
    .setName('presence')
    .setDescription('RESTRICTED TO BOT ADMINS')
    .addStringOption(status => status.setName('status')
        .setDescription('The Status of the Bot.')
        .setChoices(
            { name: 'Online', value: 'online' },
            { name: 'Idle', value: 'idle' },
            { name: 'Do Not Disturb', value: 'dnd' },
            { name: 'Invisible', value: 'invisible' }
        )
        .setRequired(true)
    )
    .addBooleanOption(afk => afk.setName('afk')
        .setDescription('The AFK state of the bot.')
        .setRequired(true)
    )
    .addStringOption(name => name.setName('name')
        .setDescription('The Name of the Presence Activity.')
        .setRequired(true)
    )
    .addIntegerOption(type => type.setName('type')
        .setDescription('The Type of the Presence Activity.')
        .setChoices(
            { name: 'Competing', value: 5 },
            { name: 'Listening', value: 2 },
            { name: 'Playing', value: 0 },
            { name: 'Watching', value: 3 })
        .setRequired(true)
    );
export function execute(interaction) {
    const status = interaction.options.getString('status');
    const afk = interaction.options.getBoolean('afk');
    const name = interaction.options.getString('name');
    const type = interaction.options.getInteger('type');

    interaction.client.user.setPresence({
        activities: [{
            name: name,
            type: type
        }],

        status: status,
        afk: afk
    });

    return interaction.reply('Bot Presence set successfully! ');
}