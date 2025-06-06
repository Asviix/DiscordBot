import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const category = 'utility';
export const cooldown = 5;
export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Get the bot\'s ping');
export
	/** @param {Discord.ChatInputCommandInteraction} interaction */
	async function execute(interaction) {
	let circles = {
		good: '🟢',
		okay: '🟡',
		bad: '🔴',
	};

	await interaction.deferReply();

	const pinging = await interaction.editReply({ content: '💨 Pinging...' });

	const ws = interaction.client.ws.ping;
	const msgEdit = pinging.createdTimestamp - interaction.createdTimestamp;

	let days = Math.floor(interaction.client.uptime / (1000 * 60 * 60 * 24));
	let hours = Math.floor((interaction.client.uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((interaction.client.uptime % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((interaction.client.uptime % (1000 * 60)) / 1000);

	const wsEmoji = ws <= 100 ? circles.good : ws <= 200 ? circles.okay : circles.bad;
	const msgEmoji = msgEdit <= 200 ? circles.good : circles.bad;

	const pingEmbed = new EmbedBuilder()
		.setAuthor({
			name: interaction.guild.members.me.displayName,
			iconURL: interaction.client.user.displayAvatarURL()
		})
		.setTitle('🏁 Pong!')
		.addFields(
			{
				name: 'WebSocket Ping',
				value: `${wsEmoji} \`${ws}ms\``,
			},

			{
				name: 'API Latency',
				value: `${msgEmoji} \`${msgEdit}ms\``,
			},

			{
				name: `${interaction.client.user.username} Uptime`,
				value: `🕒 \`${days}d ${hours}h ${minutes}m ${seconds}s\``,
			}
		)
		.setFooter({
			text: interaction.guild.name + ' Utility',
			iconURL: interaction.guild.iconURL()
		})
		.setTimestamp();

	return interaction.editReply({ embeds: [pingEmbed], content: '\u200b' });
}