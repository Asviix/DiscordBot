import { CommandInteraction, Collection, PermissionFlagsBits } from "discord.js";

/**
 * Handles the cooldown for a command interaction.
 * @param {CommandInteraction} interaction 
 * @param {Object} command - The command object containing the command data and cooldown settings.
 * @returns {{ onCooldown: boolean, reply?: string}} An object indicating whether the command is on cooldown and an optional reply message.
 */
export function checkCooldown(interaction, command) {
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    };

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return {
                onCooldown: true,
                reply: `⌛ Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`
            };
        };
    };

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    return { onCooldown: false };
};